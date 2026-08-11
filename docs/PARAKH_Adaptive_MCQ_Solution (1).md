

AI-Based Adaptive Learning MCQ System for PARAKH
Web-Based Adaptive Testing with AI-Generated Questions  |  Smart Automation Software  |  All India
Council for Technical Education (AICTE)
## 1. Problem Understanding
PARAKH currently delivers online assessments to engineering students by randomly selecting MCQs from a fixed
question  bank.  While  each  test  is  designed  to  be  unidimensional,  reliable,  and  psychometrically  sound,  random
selection does not adjust to an individual student's ability, wastes easy questions on high-ability students and hard
questions  on  low-ability  students,  and  risks  question  repetition  and  predictability  across  cohorts  and  assessment
cycles. The objective is to build a web-based Adaptive MCQ Testing System that first gauges a student's baseline
ability  through  a  short  pre-assessment,  then  dynamically  selects  (and  where  needed,  AI-generates)  subsequent
questions  based  on  the  student's  real-time  performance,  response  time,  question  difficulty  history,  and  prior
exposure - ensuring every student is assessed efficiently, fairly, and precisely at their actual proficiency level.
## 2. Objectives
## •
Replace  static  random  question  selection  with  a  Computerized  Adaptive  Testing  (CAT)  engine  that  tailors
question difficulty to each student in real time.
## •
Administer  a  short  pre-assessment  to  establish  an  initial  ability  estimate  before  the  main  adaptive  test
begins.
## •
Factor  in  response  correctness,  time  spent  per  question,  question  difficulty  level,  and  how  many  times  a
question has previously been used, when selecting the next item.
## •
Integrate an AI question-generation module so the system is not limited to a fixed bank, reducing repetition
and item overexposure.
## •
Preserve psychometric rigor (unidimensionality, reliability, appropriate difficulty spread) across both banked
and AI-generated items.
## •
Provide AICTE with dashboards for institution-, program-, and student-level proficiency analytics.
- System Architecture (Layered Description)
## 3.1 Presentation Layer
## •
Web-based  student  portal  (responsive,  browser-based)  for  taking  the  pre-assessment  and  adaptive  final
assessment.
## •
Institution/admin dashboard for AICTE-approved institutions to schedule tests and view reports.
## •
Proctoring interface (webcam/browser-lock integration) to preserve assessment integrity.
3.2 Adaptive Testing Engine (Core Layer)
## •
Ability Estimator: maintains a running estimate of each student's proficiency (theta) using an Item Response
Theory (IRT) model, updated after every response.
## •
Item Selection Algorithm: chooses the next question by matching item difficulty to the student's current ability
estimate, while factoring in response time and item exposure count.
## •
Exposure Control Module: tracks how many times each question has been served across all students and
de-prioritizes overused items to protect test-bank security.
## •
Stopping  Rule  Engine:  ends  the  test  when  a  target  measurement  precision  is  reached  or  a  maximum
item/time limit is hit.
3.3 AI Question Generation Layer
## •
Generative module (LLM-based, fine-tuned on engineering curricula) that creates new MCQs on demand for
topics/difficulty levels where the static bank is thin or overexposed.
## •
Automated difficulty calibration: newly generated items are tagged with a provisional difficulty based on topic
complexity and refined using real student response data (field-testing).
## •
Human-in-the-loop  review  queue  where  subject-matter  experts  approve  AI-generated  items  before  they
enter the live, scored question pool.
## 3.4 Data Layer
## •
Relational database for students, questions, sessions, responses, and ability estimates.

## •
Item bank repository storing both curated and AI-generated questions with full psychometric metadata.
## •
Analytics warehouse for institution- and national-level reporting to AICTE.
## 3.5 Integration & Infrastructure Layer
## •
REST APIs connecting the student portal, adaptive engine, and AI generation service.
## •
Authentication via institutional single sign-on / student ID linked to AICTE records.
## •
Hosting on scalable, government-empanelled cloud infrastructure to handle concurrent national-level testing
windows.
## 4. Suggested Technology Stack
LayerSuggested Technologies
FrontendReact.js / Angular, responsive design for desktop and low-bandwidth access
Backend / Adaptive EnginePython (FastAPI/Django) hosting the IRT-based item-selection logic
AI Question GenerationLLM API fine-tuned/prompted on engineering syllabi, with a review microservice for expert validation
Database - RelationalPostgreSQL/MySQL for students, sessions, responses, item bank
Caching / Real-Time StateRedis for live session ability estimates during a test
AnalyticsBI/data-warehouse layer for AICTE institution- and national-level dashboards
HostingGovernment-empanelled cloud, containerized (Docker/Kubernetes) for scale during national testing windows
- End-to-End Procedure / Workflow
Step 1 - Student Login and Test Setup
Student  logs  in  via  institutional  credentials  linked  to  AICTE  records;  the  system  loads  the  subject/skill  area  and
confirms test rules and duration.
Step 2 - Pre-Assessment (Baseline Estimation)
A  short,  fixed  set  of  MCQs  spanning  multiple  topics  and  difficulty  levels  is  administered  first.  Results  give  the
adaptive  engine  an  initial  ability  estimate  (theta_0)  for  the  student,  avoiding  a  cold  start  where  the  very  first
main-test question is a pure guess at difficulty.
## Step 3 - Adaptive Final Assessment
The engine selects the first main-test question near the student's estimated ability. After each response, it updates
the ability estimate based on: (a) correctness, (b) time spent relative to the expected time for that item's difficulty,
(c)  the  item's  calibrated  difficulty,  and  (d)  the  item's  prior  exposure  count.  A  correct,  fast  answer  raises  the  next
question's difficulty; an incorrect or slow answer lowers it. This repeats until the stopping rule is met.
Step 4 - Item Selection with AI Augmentation
For each selection point, the engine first checks the calibrated static item bank for a suitable question at the target
difficulty  and  topic  that  has  not  been  overexposed.  If  no  suitable  banked  item  exists,  the  AI  Question  Generation
module creates a new candidate item in real time (or from a pre-generated buffer), which is either auto-approved (if
generated from a pre-vetted template) or routed for rapid expert review before being served.
Step 5 - Scoring and Reporting
On   completion,   the   system   computes   a   final   proficiency   score   (scaled   ability   estimate),   a   topic-wise
strength/weakness breakdown, and a reliability/confidence indicator. Reports are made available to the student and
to the institution, and aggregated anonymized data flows to AICTE's national analytics dashboard.
Step 6 - Item Bank Maintenance and Recalibration
Response data from every administered item (banked or AI-generated) feeds back into a periodic recalibration job
that  refines  difficulty  estimates,  retires  overexposed  or  poorly  discriminating  items,  and  promotes  well-performing
AI-generated items into the permanent, psychometrically validated item bank.
- Database Design (Key Entities)
## •
Students: student_id, name, institution_id, program, enrollment details, current ability estimate.

## •
Institutions: institution_id, name, AICTE approval code, contact details.
## •
Question_Bank:   question_id,   topic,   sub_topic,   difficulty_level   (calibrated   IRT   parameters   such   as
discrimination      and      difficulty),      source      (curated      /      AI-generated),      exposure_count,      status
## (active/retired/under-review).
## •
Question_Options: option_id, question_id, option_text, is_correct.
## •
Test_Sessions: session_id, student_id, test_type (pre-assessment/final), start_time, end_time, status.
## •
Responses:  response_id,  session_id,  question_id,  selected_option_id,  is_correct,  time_taken_seconds,
ability_estimate_after_response.
## •
AI_Generated_Items_Queue:    item_id,    generated_text,    target_topic,    target_difficulty,    review_status,
reviewer_id, review_date.
## •
Results: result_id, session_id, final_ability_score, topic_wise_breakdown, reliability_index, generated_on.
## •
Exposure_Log: log_id, question_id, session_id, served_on - used by the Exposure Control Module to cap
item reuse.
Relationships:  one  Institution  has  many  Students;  one  Student  has  many  Test_Sessions;  one  Session  has  many
Responses  (one  per  question)  and  exactly  one  Results  record;  Question_Bank  items  are  referenced  by  both
Responses and Exposure_Log, keeping exposure tracking decoupled from live scoring data for performance.
- Adaptive Selection Algorithm (Logic Summary)
The  core  engine  is  modeled  on  Item  Response  Theory  (commonly  the  2-Parameter  Logistic  model),  where  each
item  has  a  calibrated  difficulty  and  discrimination  value,  and  each  student  has  an  evolving  ability  estimate.  After
every response, the engine: (1) updates the ability estimate using a maximum-likelihood or Bayesian update rule;
(2) computes an information function across candidate items to find the one that will most precisely measure the
student at their current estimated ability; (3) applies an exposure-control constraint so no single item is served far
more  often  than  others;  (4)  applies  a  time-weighting  factor  -  unusually  fast  correct  answers  or  slow  incorrect
answers can flag guessing or careless errors and adjust confidence in that response; and (5) checks the stopping
rule (standard error of measurement below a threshold, or maximum item count reached) before selecting the next
item or ending the test. When the ideal difficulty/topic combination is not available in the bank, the request is routed
to the AI Question Generation layer instead of falling back to random selection.
- Security, Integrity, and Compliance
## •
Encrypted storage and transmission of student responses and scores.
## •
Exposure control and item rotation to prevent question banks from becoming predictable or leaked.
## •
Expert  review  gate  for  all  AI-generated  items  before  they  affect  scored  results,  to  maintain  psychometric
validity.
## •
Browser lockdown / webcam proctoring options for high-stakes assessment windows.
## •
Role-based access separating institution admins, AICTE analysts, and content reviewers.
## •
Full audit trail of every item served, response given, and ability-estimate update for each session.
## 9. Implementation Roadmap
## •
Phase 1: Calibrate existing question bank with IRT parameters using historical response data.
## •
Phase  2:  Build  and  pilot  the  adaptive  engine  (pre-assessment  +  IRT-based  item  selection)  using  the
calibrated static bank only.
## •
Phase  3:  Integrate  the  AI  question-generation  module  with  an  expert  review  workflow;  begin  field-testing
AI-generated items.
## •
Phase  4:  Pilot  the  complete  system  with  a  subset  of  AICTE-approved  institutions;  validate  score  reliability
against existing assessment outcomes.
## •
Phase 5: National rollout with institution dashboards and AICTE-level analytics reporting.
- Non-Functional Requirements
## •
Scalability: must support simultaneous national-level testing windows with thousands of concurrent students
across AICTE-approved institutions without degradation in response-selection latency.
## •
Low Latency: the adaptive engine must select and serve the next question within a sub-second window to
preserve a smooth test-taking experience.

## •
Fairness and Validity: the algorithm must guarantee that students of similar true ability receive comparably
difficult tests, and that scores remain comparable across different question sequences.
## •
Availability:  target  uptime  of  99.5%  or  higher  during  scheduled  assessment  windows,  with  automatic
session-resume in case of network interruption.
## •
Accessibility:  support  for  low-bandwidth  connections  and  basic  devices,  given  the  wide  geographic  and
infrastructural spread of AICTE-approved institutions.
## •
Auditability: every adaptive decision (item selected, reason, ability estimate before/after) must be logged for
post-hoc psychometric review and grievance handling.
- Roles and Stakeholder Interactions
## 11.1 Student
Takes  the  pre-assessment  and  adaptive  final  assessment,  views  personal  proficiency  reports,  and  may  access
topic-wise feedback to guide further learning.
## 11.2 Institution Administrator
Schedules  assessment  windows  for  their  students,  monitors  completion  status,  and  accesses  institution-level
performance dashboards without seeing item-level security details of the adaptive engine.
11.3 Subject-Matter Expert / Reviewer
Reviews  AI-generated  questions  queued  by  the  AI  Question  Generation  Layer,  approves,  edits,  or  rejects  them
before  they  are  allowed  to  enter  the  scored,  live  item  pool,  and  periodically  audits  flagged  items  with  unusual
response patterns (for example, unexpectedly low discrimination).
11.4 AICTE Analyst
Accesses  national  and  program-level  analytics  on  student  proficiency  trends,  item  bank  health  (exposure  rates,
difficulty  spread,  retirement  candidates),  and  overall  system  performance  to  guide  curriculum  and  assessment
policy decisions.
Note: This document contains no diagrams; all architecture, workflow, algorithm, and database structures are described in text
form as requested.