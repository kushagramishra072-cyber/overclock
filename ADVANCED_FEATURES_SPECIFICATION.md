# Student Survival: Advanced Predictive Intelligence Systems

## PART 1: 7-DAY SURVIVAL FORECAST ENGINE

### Data Models

```typescript
interface ForecastDay {
  day: number;
  date: Date;
  predictedScore: number;
  weatherState: WeatherState;
  riskFlags: RiskFlag[];
  backlogProjection: number;
  examPressureLevel: 'low' | 'medium' | 'high' | 'critical';
  sleepProjection: number;
  studyQualityProjection: number;
}

interface SurvivalForecast {
  generatedAt: Date;
  currentScore: number;
  forecast: ForecastDay[];
  overallTrend: 'improving' | 'stable' | 'declining' | 'critical';
  riskAssessment: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
}

type RiskFlag = 'predicted-overload' | 'exam-spike' | 'sleep-deficit' | 'burnout-warning';
type WeatherState = 'clear' | 'cloudy' | 'building-pressure' | 'storm-warning' | 'emergency';
```

### Algorithm

```
Function: predictSurvivalScore(day, currentBacklog, examSchedule, sleepData, studyData)
  
  Input:
    - currentBacklog: number of pending tasks
    - taskCompletionRate: avg tasks completed per day (5-day avg)
    - taskAdditionRate: avg tasks added per day (5-day avg)
    - daysUntilNextExam: number
    - examsWithin14Days: Exam[]
    - sleepAvg5Days: number in minutes
    - studyQualityAvg5Days: 0-100
    - clasLoadPerDay: number of classes scheduled
    - freeTimePerDay: minutes
    
  For each simulated day (1-7):
    
    // Step 1: Update backlog
    projectedBacklog = currentBacklog + (taskAdditionRate - taskCompletionRate)
    
    // Step 2: Calculate exam pressure (increases as exam approaches)
    examPressure = 0
    for each exam in examsWithin14Days:
      daysToExam = max(0, exam.date - today - dayIterator)
      if daysToExam == 0:
        examPressure += 30  // Exam day: max pressure
      else if daysToExam <= 3:
        examPressure += 20 * (3 - daysToExam) / 3  // Escalating
      else if daysToExam <= 7:
        examPressure += 15 * (7 - daysToExam) / 7
      else:
        examPressure += 5  // Low background pressure
    
    // Step 3: Sleep multiplier
    projectedSleep = sleepAvg5Days  // Assume consistent sleep
    sleepMultiplier = 1.0
    if projectedSleep < 360:  // < 6 hours
      sleepMultiplier = 0.8
    else if projectedSleep >= 420:  // >= 7 hours
      sleepMultiplier = 1.1
    
    // Step 4: Study quality modifier
    studyModifier = studyQualityAvg5Days / 100
    
    // Step 5: Class load tolerance
    classLoadTolerance = min(1.0, freeTimePerDay / 180)  // 3 hours free time = normal
    if clasLoadPerDay > 5:
      classLoadTolerance *= 0.9
    
    // Step 6: Simulate task completion vs addition
    completionCapacity = (freeTimePerDay / 60) * 2  // ~2 tasks per free hour
    if projectedBacklog > completionCapacity:
      pressureFactor = 0.85  // Lower completion rate when overloaded
    else:
      pressureFactor = 1.0
    
    // Step 7: Recalculate predicted score
    // Use existing Survival Score formula with projected values
    completionRate = min(100, (tasksCompleted / totalTasks) * 100) * pressureFactor
    deadlinePressure = min(100, completionRate + examPressure)  // Exam pressure adds
    
    predictedScore = calculateSurvivalScore(
      completionRate,
      deadlinePressure,
      sleepMultiplier * 100,
      studyModifier * 100
    )
    
    // Step 8: Weather mapping
    weatherState = mapScoreToWeather(predictedScore)
    
    // Step 9: Risk flags
    riskFlags = []
    if predictedScore < 50:
      riskFlags.push('predicted-overload')
    if examPressure > 25:
      riskFlags.push('exam-spike')
    if projectedSleep < 360:
      riskFlags.push('sleep-deficit')
    if dayIterator > 2 && forecastSlope < -5:  // Score dropping >5pts/day
      riskFlags.push('burnout-warning')
    
  return forecast
```

### Implementation Details

- Store 5-day rolling averages for task completion/addition rates
- Update forecast daily with fresh data
- Cache predictions for 6 hours to avoid recomputation
- Return confidence score (0-100) for each forecast based on data age and variance

---

## PART 2: STUDY TIMER + SESSION QUALITY SYSTEM

### Data Models

```typescript
interface StudySession {
  id: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  isPaused: boolean;
  pausedAt?: Date;
  totalPausedMinutes: number;
  focusRating: 1 | 2 | 3 | 4 | 5;        // Self-reported
  energyRating: 1 | 2 | 3 | 4 | 5;       // Self-reported
  effectivenessRating: 1 | 2 | 3 | 4 | 5; // Self-reported
  reflectionText?: string;
  qualityScore: number;  // Computed: (focus + energy + effectiveness) / 3 * 33
  timestamp: Date;
}

interface StudySessionStore {
  sessions: StudySession[];
  activeSession?: StudySession;
  sessionHistory: StudySession[];  // Last 30 days
}
```

### Timer Logic (Pseudocode)

```
Class StudyTimer:
  
  constructor(subject: string, estimatedMinutes: number):
    this.subject = subject
    this.estimatedMinutes = estimatedMinutes
    this.elapsedSeconds = 0
    this.pausedSeconds = 0
    this.isPaused = false
    this.startTime = now()
    this.intervalId = null
  
  start():
    this.intervalId = setInterval(() => {
      if not this.isPaused:
        this.elapsedSeconds += 1
    }, 1000)
  
  pause():
    this.isPaused = true
    this.pauseStartTime = now()
  
  resume():
    if this.isPaused:
      this.pausedSeconds += (now() - this.pauseStartTime)
      this.isPaused = false
  
  stop():
    clearInterval(this.intervalId)
    this.endTime = now()
    return this.createSession()
  
  getDuration():
    return this.elapsedSeconds - this.pausedSeconds
  
  createSession():
    return StudySession {
      durationMinutes: floor(this.getDuration() / 60),
      subject: this.subject,
      startTime: this.startTime,
      endTime: now(),
      totalPausedMinutes: floor(this.pausedSeconds / 60),
      qualityScore: 0  // Pending user ratings
    }
```

### Quality Calculation

```
Function: calculateSessionQuality(focus, energy, effectiveness):
  return ((focus + energy + effectiveness) / 15) * 100
  
  // Examples:
  // 5 + 5 + 5 = 100% quality
  // 3 + 3 + 3 = 60% quality
  // 2 + 2 + 2 = 40% quality
```

### Influence on Survival Score

```
// Quality matters more than raw hours
sessionQualityInfluence = (sessionQualityScore / 100) * (sessionDurationMinutes / 60) * 0.05

// Maximum session influence: 5 points per 1-hour perfect session
// Sessions feed into study quality rolling average (5-day)
```

---

## PART 3: FOCUS PATTERN DETECTION ENGINE

### Data Models

```typescript
interface FocusPattern {
  type: 'time-of-day' | 'session-length' | 'sleep-correlation' | 'exam-proximity' | 'fatigue-pattern';
  confidenceScore: number;  // 0-100, only show if > 60
  insightMessage: string;
  supportingData: {
    correlationCoefficient: number;
    sampleSize: number;
    timeframe: 'this-week' | 'this-month' | 'all-time';
  };
}

interface InsightEngine {
  patterns: FocusPattern[];
  lastUpdated: Date;
  minimumDataPoints: number;  // Require 7+ sessions for analysis
}
```

### Correlation Analysis Algorithm

```
Function: detectFocusPatterns(sessionHistory: StudySession[]):
  
  if sessionHistory.length < 7:
    return []  // Need minimum data
  
  patterns = []
  
  // PATTERN 1: Time of Day vs Focus
  hourBuckets = groupSessionsByHour(sessionHistory)
  bestHours = findHighestAverageFocus(hourBuckets)
  worstHours = findLowestAverageFocus(hourBuckets)
  
  if correlation(bestHours, focus) > 0.7:
    patterns.push({
      type: 'time-of-day',
      confidenceScore: correlation * 100,
      insightMessage: `You focus best in the ${formatTimeRange(bestHours)}`,
      supportingData: { ... }
    })
  
  // PATTERN 2: Session Duration vs Effectiveness
  durationBuckets = groupSessionsByDuration(sessionHistory)
  // Find sweet spot duration
  optimalDuration = findPeakEffectiveness(durationBuckets)
  
  if variance(durationBuckets[optimalDuration]) > 0.8:
    patterns.push({
      type: 'session-length',
      confidenceScore: 75,
      insightMessage: `${optimalDuration}-minute sessions work best for ${topSubject}`,
      supportingData: { ... }
    })
  
  // PATTERN 3: Sleep Quality vs Focus
  sleepFocusCorr = pearsonCorrelation(sleepData, focusRatings)
  
  if abs(sleepFocusCorr) > 0.65:
    patterns.push({
      type: 'sleep-correlation',
      confidenceScore: 80,
      insightMessage: `Your focus drops significantly after <7 hours of sleep`,
      supportingData: { ... }
    })
  
  // PATTERN 4: Exam Proximity Impact
  examProximityEffect = []
  for each exam in exams:
    beforeExam = sessions before exam, grouped by days-to-exam
    effectivenessDropoff = calculateDropoff(beforeExam)
    examProximityEffect.push(effectivenessDropoff)
  
  avgDropoff = mean(examProximityEffect)
  if avgDropoff > 15:  // 15% drop in effectiveness
    patterns.push({
      type: 'exam-proximity',
      confidenceScore: 70,
      insightMessage: `Your focus typically declines ${avgDropoff}% as exams approach`,
      supportingData: { ... }
    })
  
  // PATTERN 5: Fatigue Detection (increasing duration, declining effectiveness)
  lastFiveSessions = sessionHistory.slice(-5)
  durationTrend = linearRegression(lastFiveSessions.map(s => s.duration))
  effectivenessTrend = linearRegression(lastFiveSessions.map(s => s.effectiveness))
  
  if durationTrend.slope > 0 and effectivenessTrend.slope < -0.2:  // Duration up, effectiveness down
    patterns.push({
      type: 'fatigue-pattern',
      confidenceScore: 85,
      insightMessage: `You're studying longer but less effectively—take a break`,
      supportingData: { ... }
    })
  
  // Sort by confidence and return top 3
  return patterns.sort((a, b) => b.confidenceScore - a.confidenceScore).slice(0, 3)
```

---

## PART 4: BURNOUT TREND ESCALATION SYSTEM

### Data Models

```typescript
type BurnoutLevel = 'low' | 'moderate' | 'high' | 'critical';

interface BurnoutIndicator {
  metric: string;
  value: number;
  threshold: number;
  status: 'safe' | 'warning' | 'critical';
}

interface BurnoutAssessment {
  level: BurnoutLevel;
  score: number;  // 0-100, higher = more burned out
  indicators: BurnoutIndicator[];
  triggered: Date;
  recommendations: string[];
  escalationTriggers: string[];
}
```

### Escalation Logic

```
Function: assessBurnoutLevel(
  sleepLogs: SleepLog[],
  focusRatings: number[],
  studySessions: StudySession[],
  survivalForecast: SurvivalForecast,
  survivalScoreHistory: number[]
):
  
  burnoutScore = 0
  indicators = []
  escalationTriggers = []
  
  // TRIGGER 1: Sleep Deficit
  last7DaysSleep = sleepLogs.slice(-7).map(s => s.durationMinutes)
  below6Hours = last7DaysSleep.filter(s => s < 360).length
  
  if below6Hours >= 3:  // 3+ days below 6 hours
    burnoutScore += 30
    indicators.push({ metric: 'sleep-deficit', value: below6Hours, threshold: 2, status: 'critical' })
    escalationTriggers.push(`${below6Hours} days with <6 hours sleep`)
  else if below6Hours >= 2:
    burnoutScore += 15
    indicators.push({ metric: 'sleep-deficit', value: below6Hours, threshold: 2, status: 'warning' })
  
  // TRIGGER 2: Focus Decline
  last7FocusRatings = focusRatings.slice(-7)
  consecutiveDeclins = countConsecutiveDeclines(last7FocusRatings, 3)
  
  if consecutiveDeclines >= 3:
    burnoutScore += 25
    indicators.push({ metric: 'focus-decline', value: consecutiveDeclines, threshold: 2, status: 'critical' })
    escalationTriggers.push('Focus declining for 3+ consecutive days')
  
  // TRIGGER 3: Effort-Effectiveness Mismatch
  last7Sessions = studySessions.slice(-7)
  durationTrend = calculateTrend(last7Sessions.map(s => s.duration))
  effectivenessTrend = calculateTrend(last7Sessions.map(s => s.effectiveness))
  
  if durationTrend > 10 and effectivenessTrend < -10:  // Duration up >10%, effectiveness down >10%
    burnoutScore += 20
    indicators.push({ metric: 'effort-mismatch', value: abs(durationTrend - effectivenessTrend), threshold: 15, status: 'critical' })
    escalationTriggers.push('Studying longer but with decreasing effectiveness')
  
  // TRIGGER 4: Forecast Decline
  forecastSlope = calculateSlope(survivalForecast.forecast.map(d => d.predictedScore))
  
  if forecastSlope < -5:  // Score declining >5pts/day
    burnoutScore += 15
    indicators.push({ metric: 'forecast-slope', value: forecastSlope, threshold: -3, status: 'critical' })
    escalationTriggers.push('Survival Score projected to decline 5+ points/day')
  
  // TRIGGER 5: Score Consistency
  last7ScoreHistory = survivalScoreHistory.slice(-7)
  avgScore = mean(last7ScoreHistory)
  variance = variance(last7ScoreHistory)
  
  if avgScore < 40:
    burnoutScore += 20
    indicators.push({ metric: 'low-score-average', value: avgScore, threshold: 50, status: 'critical' })
    escalationTriggers.push(`Survival Score averaging ${avgScore} (low)`)
  
  // Determine level
  level = 'low'
  if burnoutScore >= 80:
    level = 'critical'
  else if burnoutScore >= 60:
    level = 'high'
  else if burnoutScore >= 30:
    level = 'moderate'
  
  // Generate recommendations
  recommendations = generateBurnoutRecommendations(level, escalationTriggers)
  
  return BurnoutAssessment {
    level,
    score: burnoutScore,
    indicators,
    recommendations,
    escalationTriggers
  }

Function: generateBurnoutRecommendations(level: BurnoutLevel, triggers: string[]):
  
  recommendations = []
  
  if level == 'critical' or level == 'high':
    recommendations.push('Immediately reduce workload by 30-50%')
    recommendations.push('Redistribute non-urgent tasks to next week')
    recommendations.push('Increase sleep target to 8+ hours')
    
    if triggers.includes('sleep-deficit'):
      recommendations.push('Sleep is critical: aim for 9 hours tonight')
    
    if triggers.includes('effort-mismatch'):
      recommendations.push('Take a 2-hour break—burnout is affecting productivity')
    
    if triggers.includes('Survival Score projected'):
      recommendations.push('Activate Crisis Mode for exam preparation if needed')
  
  return recommendations
```

---

## PART 5: ACADEMIC WEATHER VISUALIZATION

### Data Models

```typescript
type WeatherState = 'clear' | 'cloudy' | 'building-pressure' | 'storm-warning' | 'emergency';

interface WeatherIcon {
  state: WeatherState;
  emoji: string;
  description: string;
  colorHex: string;
}

const WEATHER_MAP: Record<WeatherState, WeatherIcon> = {
  clear: { emoji: '☀️', description: 'All clear', colorHex: '#22C55E' },
  cloudy: { emoji: '☁️', description: 'Manageable', colorHex: '#64748B' },
  building-pressure: { emoji: '⛅', description: 'Building pressure', colorHex: '#F59E0B' },
  storm-warning: { emoji: '⛈️', description: 'Storm warning', colorHex: '#EF4444' },
  emergency: { emoji: '🌪️', description: 'Emergency', colorHex: '#991B1B' }
};

interface WeatherForecastDay {
  day: number;
  date: Date;
  predictedScore: number;
  weatherState: WeatherState;
  colorCode: string;
  slopeIndicator: 'improving' | 'stable' | 'declining';
}
```

### Score-to-Weather Mapping

```
Function: mapScoreToWeather(score: number, previousScore: number): WeatherState {
  
  slope = score - previousScore
  slopeIndicator = 'stable'
  
  if slope > 5:
    slopeIndicator = 'improving'
  else if slope < -5:
    slopeIndicator = 'declining'
  
  if score >= 85:
    return 'clear'
  else if score >= 70:
    return 'cloudy'
  else if score >= 50:
    return 'building-pressure'
  else if score >= 30:
    return 'storm-warning'
  else:
    return 'emergency'
}
```

### UI Component Structure

```
WeatherForecast Component:
  
  Input: survivalForecast (7-day array)
  
  Render:
    <div className="forecast-strip">
      {forecast.map((day) => (
        <div 
          className="forecast-day"
          style={{ backgroundColor: WEATHER_MAP[day.weatherState].colorHex }}
        >
          <div className="emoji">{WEATHER_MAP[day.weatherState].emoji}</div>
          <div className="score">{day.predictedScore}</div>
          <div className="slope">
            {day.slopeIndicator === 'improving' && '📈'}
            {day.slopeIndicator === 'stable' && '➡️'}
            {day.slopeIndicator === 'declining' && '📉'}
          </div>
        </div>
      ))}
    </div>
```

---

## PART 6: CRISIS MODE (EMERGENCY EXAM OPTIMIZATION SYSTEM)

### Data Models

```typescript
interface CrisisModeSession {
  id: string;
  examId: string;
  activatedAt: Date;
  daysRemaining: number;
  dailyStudyTarget: number;  // minutes
  currentStatus: 'active' | 'paused' | 'completed' | 'exam-failed';
  recoveryPlan: CrisisRecoveryPlan;
  projectedOutcome: number;  // Predicted Survival Score if plan followed
}

interface CrisisRecoveryPlan {
  topicPriority: TopicPriority[];
  dailySchedule: DailyBlock[];
  totalRequiredHours: number;
  availableHours: number;
  recoveryFeasibility: 'feasible' | 'challenging' | 'impossible';
  estimatedScoreIncrease: number;
}

interface TopicPriority {
  topic: string;
  priority: 1 | 2 | 3 | 4 | 5;  // 5 = highest
  estimatedStudyTime: number;  // minutes
  weakness: boolean;  // Low past focus or incomplete
  weight: number;  // How much of exam is this topic
}

interface DailyBlock {
  date: Date;
  blocks: StudyBlock[];
  totalMinutes: number;
}

interface StudyBlock {
  startTime: string;
  endTime: string;
  topic: string;
  blockType: 'learning' | 'revision' | 'practice-test';
}
```

### Crisis Mode Algorithm

```
Function: activateCrisisMode(
  exam: Exam,
  topics: string[],
  dailyAvailableMinutes: number,
  currentBacklog: Task[],
  currentSurvivalScore: number
):
  
  daysRemaining = exam.date - today
  
  // STEP 1: Calculate required load
  estimatedHoursPerTopic = 3  // Baseline
  totalRequiredMinutes = 0
  
  for each topic in topics:
    // If user has weak focus on this topic, add 30%
    weakness = (userFocusOnTopic < 60) ? 1.3 : 1.0
    
    // If topic weight is high in exam, prioritize
    topicWeight = getTopicWeightInExam(topic)  // 0-1
    timeMultiplier = 1.0 + (topicWeight * 0.5)
    
    totalRequiredMinutes += estimatedHoursPerTopic * 60 * weakness * timeMultiplier
  
  dailyRequiredMinutes = totalRequiredMinutes / daysRemaining
  
  // STEP 2: Check feasibility
  if dailyRequiredMinutes > dailyAvailableMinutes:
    feasibility = 'challenging'
    if dailyRequiredMinutes > (dailyAvailableMinutes * 1.3):
      feasibility = 'impossible'
      flag: "Recovery may not be possible—consider exam postponement"
  else:
    feasibility = 'feasible'
  
  // STEP 3: Topic prioritization
  topicPriorities = []
  
  for each topic in topics:
    weakness = (userFocusOnTopic < 60)
    examProximity = daysRemaining
    topicWeight = getTopicWeightInExam(topic)
    
    // Priority formula: exam proximity + weakness + weight
    priority = (5 - examProximity/2) + (weakness * 2) + (topicWeight * 3)
    priority = clamp(priority, 1, 5)
    
    topicPriorities.push({
      topic,
      priority,
      weakness,
      weight: topicWeight
    })
  
  // STEP 4: Generate daily schedule
  dailySchedule = []
  remainingMinutes = totalRequiredMinutes
  
  for each day from today to exam:
    blocks = []
    dayMinutesAllocated = 0
    
    // Learning blocks (early days)
    if daysRemaining > 3:
      for each topic in topicPriorities.sort(byPriority):
        if dayMinutesAllocated < (dailyRequiredMinutes * 0.6):
          blockDuration = min(90, remainingMinutes - dayMinutesAllocated)
          blocks.push({
            startTime: formatTime(currentTime + dayMinutesAllocated),
            endTime: formatTime(currentTime + dayMinutesAllocated + blockDuration),
            topic,
            blockType: 'learning'
          })
          dayMinutesAllocated += blockDuration
    
    // Revision blocks (1-3 days before)
    if daysRemaining <= 3:
      for each topic in topicPriorities.sort(byPriority):
        blockDuration = min(60, dailyRequiredMinutes - dayMinutesAllocated)
        blocks.push({
          blockType: 'revision',
          ...
        })
    
    // Practice tests (final day)
    if daysRemaining == 1:
      blocks.push({ blockType: 'practice-test', duration: 120 })
    
    // Add sleep protection minimum
    sleepTime = 8 * 60  // 8 hours minimum
    if totalScheduledMinutes + sleepTime > 1440:
      flag: "Schedule exceeds 24 hours—reduce expectations"
    
    dailySchedule.push({
      date: day,
      blocks,
      totalMinutes: dayMinutesAllocated
    })
  
  // STEP 5: Project outcome
  baselineScore = currentSurvivalScore
  
  // If plan is followed successfully:
  completionBonus = 15  // +15 for full exam prep
  focusBonus = (feasibility == 'feasible') ? 10 : 5
  
  projectedScore = baselineScore + completionBonus + focusBonus
  
  return CrisisModeSession {
    daysRemaining,
    recoveryPlan: {
      topicPriority: topicPriorities,
      dailySchedule,
      totalRequiredHours: totalRequiredMinutes / 60,
      availableHours: dailyAvailableMinutes * daysRemaining / 60,
      recoveryFeasibility: feasibility,
      estimatedScoreIncrease: projectedScore - baselineScore
    },
    projectedOutcome: projectedScore
  }
```

### Crisis Mode Deactivation Logic

```
Function: shouldDeactivateCrisisMode(session: CrisisModeSession):
  
  return (
    session.exam.hasOccurred() ||
    survivalScore > 75 ||
    session.burnoutLevel == 'critical'  // Protect mental health
  )
```

### AI Tutor Mode (Context-Aware)

```
Function: crisisTutorResponse(
  topic: string,
  userQuestion: string,
  availableMinutes: number,
  examProximity: 'days-away' | 'hours-away'
):
  
  if examProximity == 'hours-away':
    // High-yield mode: focus on key concepts only
    responseLength = 'concise'  // <100 words
    focusOn = 'most-tested-concepts'
    include = ['key-definitions', 'formula-review']
    exclude = ['deep-theory', 'historical-context']
  
  else if examProximity == 'days-away':
    // Balanced learning
    responseLength = 'moderate'  // 200-300 words
    focusOn = 'core-understanding'
    include = ['explanations', 'examples', 'practice']
  
  // Generate response
  response = generateTutorResponse(topic, userQuestion, responseLength)
  
  if availableMinutes < 5:
    response.suggestSkipQandA = true
    response.suggestMoveToNextTopic = true
  
  return response
```

---

## INTEGRATION ARCHITECTURE

### Data Flow

```
┌─────────────────────────────────────┐
│  Task/Exam/Sleep/Schedule Data      │ (Existing stores)
└──────────────┬──────────────────────┘
               │
         ┌─────▼──────┐
         │ Calculation │ (New utility module)
         │  Engine     │
         └─────┬──────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼───┐ ┌───▼───┐ ┌───▼────┐
│Forecast  Focus  Burnout
│Engine    Pattern  Assessment
│          Engine   Engine
└───┬───┘ └───┬───┘ └───┬────┘
    │         │         │
    └─────┬───┴────┬────┘
          │        │
     ┌────▼────┐   │
     │Dashboard│   │
     │Integration  │
     └─────────┘   │
                   │
            ┌──────▼─────┐
            │ Crisis Mode │
            │  Activation │
            └─────────────┘
```

### File Structure

```
client/
  lib/
    predictions.ts        // Forecast engine
    patterns.ts          // Focus detection
    burnout.ts           // Burnout assessment
    crisisMode.ts        // Crisis optimization
  hooks/
    usePredictions.ts    // Forecast hook
    useStudySession.ts   // Timer + session tracking
    useBurnoutAlert.ts   // Burnout monitoring
    useCrisisMode.ts     // Crisis mode activation
  components/
    WeatherForecast.tsx  // 7-day visualization
    StudyTimer.tsx       // Timer UI
    FocusInsights.tsx    // Pattern cards
    BurnoutAlert.tsx     // Alert display
    CrisisMode.tsx       // Crisis mode UI
  pages/
    Analytics.tsx        // Comprehensive dashboard
    CrisisMode.tsx       // Crisis mode full page
```

---

## PERFORMANCE CONSIDERATIONS

- **Forecast Caching**: Compute once per day, cache for 6 hours
- **Pattern Detection**: Run on 30-minute debounce (avoid constant recomputation)
- **Burnout Assessment**: Lightweight check on daily app load
- **Crisis Mode**: Expensive computation, compute on-demand only
- **Database**: All historical data cached in localStorage with 30-day retention

---

## Safety & Guardrails

- Crisis Mode projections flagged as "estimates—not guarantees"
- Burnout Critical triggers human review recommendations
- Never remove study data; only archive
- All predictive scores clearly labeled as "projected"
- User can manually override or reset any prediction
