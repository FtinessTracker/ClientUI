/*
  # Create Research Articles Table

  1. New Tables
    - `research_articles`
      - `id` (uuid, primary key) - unique article identifier
      - `title` (text) - article title
      - `summary` (text) - brief article summary/abstract
      - `content` (text) - full article body in markdown
      - `author_name` (text) - article author display name
      - `author_avatar_url` (text) - author avatar image URL
      - `category` (text) - article category (e.g., 'nutrition', 'exercise_science')
      - `tags` (text[]) - array of keyword tags
      - `cover_image_url` (text) - hero/cover image URL
      - `source_url` (text) - external link to original publication
      - `source_name` (text) - name of original publication
      - `read_time_minutes` (integer) - estimated read time
      - `is_featured` (boolean) - whether article is featured/promoted
      - `is_published` (boolean) - whether article is visible to clients
      - `published_at` (timestamptz) - publication date
      - `created_at` (timestamptz) - record creation timestamp
      - `updated_at` (timestamptz) - record update timestamp

  2. Security
    - Enable RLS on `research_articles` table
    - Authenticated users can read published articles
    - No client-side write access (admin/backend only)

  3. Indexes
    - `idx_research_articles_published_at` for sorting by date
    - `idx_research_articles_category` for filtering by category
    - `idx_research_articles_is_published` for filtering published articles

  4. Seed Data
    - 8 sample research articles across various fitness/wellness categories
*/

CREATE TABLE IF NOT EXISTS research_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  author_name text NOT NULL DEFAULT '',
  author_avatar_url text DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  tags text[] DEFAULT '{}',
  cover_image_url text DEFAULT '',
  source_url text DEFAULT '',
  source_name text DEFAULT '',
  read_time_minutes integer DEFAULT 5,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE research_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read published articles"
  ON research_articles FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE INDEX IF NOT EXISTS idx_research_articles_published_at ON research_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_articles_category ON research_articles(category);
CREATE INDEX IF NOT EXISTS idx_research_articles_is_published ON research_articles(is_published);

INSERT INTO research_articles (title, summary, content, author_name, author_avatar_url, category, tags, cover_image_url, source_url, source_name, read_time_minutes, is_featured, is_published, published_at) VALUES
(
  'High-Intensity Interval Training: Maximizing Fat Loss in Minimal Time',
  'A comprehensive meta-analysis of 42 randomized controlled trials reveals that HIIT protocols produce 28.5% greater fat reduction compared to moderate-intensity continuous training, with sessions as short as 20 minutes showing significant metabolic benefits.',
  'High-intensity interval training (HIIT) has emerged as one of the most time-efficient exercise strategies for improving cardiovascular health and body composition. This meta-analysis examined data from 42 randomized controlled trials involving over 1,800 participants across diverse populations.

Key findings indicate that HIIT protocols lasting 20-30 minutes produced significantly greater reductions in total body fat percentage (-2.3% vs -1.8%) compared to moderate-intensity continuous training (MICT) performed for 40-60 minutes. The effect was most pronounced in participants with higher baseline body fat percentages.

The research also demonstrated that HIIT improved VO2max by an average of 9.1%, compared to 5.4% for MICT. These improvements were observed across all age groups studied (18-65 years), though the magnitude of response varied with training frequency and duration of the intervention period.

Importantly, adherence rates were comparable between groups (78% for HIIT vs 75% for MICT), challenging the common assumption that higher-intensity protocols lead to greater dropout rates. Participants in the HIIT groups reported higher enjoyment scores, potentially due to the variety inherent in interval-based programming.

These findings suggest that HIIT represents an effective, time-efficient alternative for individuals seeking to improve cardiometabolic health and reduce body fat, particularly when time constraints limit exercise duration.',
  'Dr. Sarah Mitchell',
  '',
  'exercise_science',
  ARRAY['HIIT', 'fat loss', 'cardio', 'meta-analysis', 'exercise science'],
  'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800',
  '',
  'Journal of Sports Medicine',
  8,
  true,
  true,
  now() - interval '2 days'
),
(
  'The Gut-Brain Axis: How Your Microbiome Influences Exercise Performance',
  'Emerging research from Stanford University identifies specific gut bacterial strains that enhance athletic endurance by up to 13%, opening new frontiers in personalized nutrition and performance optimization.',
  'The relationship between gut microbiota and athletic performance has become one of the most exciting areas of sports science research. A landmark study from Stanford University, analyzing the microbiomes of 200 elite and recreational athletes, has identified specific bacterial strains strongly correlated with enhanced endurance performance.

The research team found that athletes with higher concentrations of Veillonella atypica showed a 13% improvement in treadmill run-to-exhaustion time. This bacterium metabolizes lactate, a byproduct of intense exercise, converting it into propionate—a short-chain fatty acid that can be used as an additional fuel source.

Furthermore, the study identified distinct microbiome profiles associated with different types of athletic performance. Endurance athletes showed enrichment of bacteria involved in amino acid and carbohydrate metabolism, while strength athletes had higher levels of bacteria associated with protein synthesis pathways.

Dietary interventions targeting the microbiome—including increased fiber intake, fermented food consumption, and strategic probiotic supplementation—showed promising results in recreational athletes, with improvements in VO2max and time-to-fatigue emerging after 8 weeks of intervention.

These findings open new avenues for personalized nutrition strategies that optimize the gut-brain axis to enhance both physical performance and mental resilience during training.',
  'Dr. James Rodriguez',
  '',
  'nutrition',
  ARRAY['microbiome', 'gut health', 'endurance', 'nutrition', 'performance'],
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
  '',
  'Nature Sports Science',
  7,
  true,
  true,
  now() - interval '5 days'
),
(
  'Progressive Overload Reimagined: Volume vs. Intensity for Hypertrophy',
  'New evidence from a 12-week resistance training study challenges traditional hypertrophy paradigms, showing that weekly volume, not per-session intensity, is the primary driver of muscle growth in trained individuals.',
  'The principle of progressive overload remains foundational to resistance training, but the optimal method of progression has been debated for decades. This 12-week randomized controlled trial, involving 60 trained men, compared two distinct progressive overload strategies.

Group A followed a traditional intensity-focused approach, progressively increasing load while maintaining constant volume (3 sets per exercise). Group B used a volume-focused approach, progressively adding sets while maintaining moderate intensity (65-75% 1RM).

Results showed that Group B achieved significantly greater increases in muscle cross-sectional area (measured via ultrasound) in both the quadriceps (+8.2% vs +5.1%) and biceps (+6.4% vs +4.7%). However, Group A demonstrated superior strength gains on 1RM tests.

The findings suggest that total weekly volume, defined as sets × reps × load, is the primary hypertrophic stimulus for trained lifters, and that distributing this volume across more sets at moderate loads may be more effective than fewer sets at higher intensities.

Practical applications include periodizing training blocks to emphasize either volume or intensity depending on the primary goal (hypertrophy vs. strength), and considering individual recovery capacity when prescribing training volume.',
  'Dr. Marcus Thompson',
  '',
  'strength_training',
  ARRAY['hypertrophy', 'progressive overload', 'strength training', 'volume', 'resistance training'],
  'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800',
  '',
  'International Journal of Strength Research',
  6,
  false,
  true,
  now() - interval '8 days'
),
(
  'Sleep Architecture and Athletic Recovery: The 90-Minute Rule',
  'A groundbreaking study tracking 150 professional athletes reveals that aligning sleep duration with 90-minute ultradian cycles significantly improves next-day performance markers and reduces perceived fatigue by 34%.',
  'Sleep quality has long been recognized as a critical factor in athletic recovery, but new research suggests that sleep timing and architecture may be even more important than total sleep duration alone.

This study tracked 150 professional athletes from multiple sports over a 16-week period using polysomnography (sleep lab monitoring) and wearable devices. Athletes who consistently achieved sleep durations aligned with 90-minute ultradian cycles (e.g., 7.5 hours = 5 complete cycles) showed significant advantages over those sleeping for non-aligned durations.

Key findings included a 34% reduction in perceived fatigue, 12% improvement in reaction time, and 8% increase in peak power output during morning training sessions. The effects were most pronounced when athletes completed at least 4 full sleep cycles per night.

The research also highlighted the importance of sleep consistency. Athletes maintaining regular sleep-wake schedules (within a 30-minute window) showed 22% better recovery metrics compared to those with variable schedules, even when total sleep duration was similar.

Practical recommendations include calculating optimal bedtime based on desired wake time and targeting complete 90-minute cycles, establishing consistent sleep schedules even on rest days, and implementing a structured wind-down routine 60-90 minutes before sleep.',
  'Dr. Elena Park',
  '',
  'recovery',
  ARRAY['sleep', 'recovery', 'performance', 'circadian rhythm', 'fatigue management'],
  'https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=800',
  '',
  'Sleep Medicine Reviews',
  7,
  false,
  true,
  now() - interval '12 days'
),
(
  'Protein Timing Revisited: The Anabolic Window Is Wider Than We Thought',
  'Multi-site clinical trial data from 8 universities demonstrates that the post-exercise protein synthesis window extends to 4-6 hours, challenging the traditional 30-minute "anabolic window" hypothesis.',
  'The concept of a narrow post-exercise anabolic window has driven supplement marketing and athlete behavior for decades. This large-scale multi-site clinical trial, conducted across 8 universities with 320 participants, provides the most comprehensive data to date on post-exercise protein timing.

Participants were assigned to one of four protein timing groups: immediate post-exercise (0-30 min), early post-exercise (1-2 hours), late post-exercise (3-4 hours), and distributed throughout the day (no specific timing). All groups consumed identical total daily protein (1.6g/kg/day).

After 16 weeks of structured resistance training, muscle protein synthesis rates and lean mass gains were statistically equivalent across all four groups. The only significant difference was observed in the distributed group, which showed a modest but significant advantage in 24-hour muscle protein synthesis rates.

These findings suggest that total daily protein intake is far more important than timing for most individuals. The practical "anabolic window" extends to at least 4-6 hours post-exercise, and distributing protein intake evenly across 4-5 meals throughout the day may provide a small additional benefit.

The one exception noted was for fasted training: participants who trained in a fasted state and delayed protein intake beyond 3 hours showed slightly lower muscle protein synthesis rates, suggesting that post-exercise nutrition is more time-sensitive when pre-exercise nutrition is absent.',
  'Dr. Amanda Chen',
  '',
  'nutrition',
  ARRAY['protein', 'muscle growth', 'nutrition timing', 'anabolic window', 'supplements'],
  'https://images.pexels.com/photos/1153369/pexels-photo-1153369.jpeg?auto=compress&cs=tinysrgb&w=800',
  '',
  'American Journal of Clinical Nutrition',
  9,
  false,
  true,
  now() - interval '15 days'
),
(
  'Mobility Training and Injury Prevention: A Systematic Review',
  'Analysis of 28 prospective studies shows that targeted mobility work reduces non-contact soft tissue injuries by 41%, with dynamic warm-ups outperforming static stretching for pre-exercise preparation.',
  'Mobility training has become an increasingly prominent component of athletic preparation and injury prevention programs. This systematic review synthesized data from 28 prospective studies involving over 5,000 participants across recreational and competitive sport settings.

The primary finding was that structured mobility programs incorporating dynamic movement preparation, joint-specific mobility drills, and neuromuscular activation exercises reduced non-contact soft tissue injuries by 41% compared to control groups performing standard warm-up routines.

The review distinguished between different types of mobility interventions. Dynamic warm-ups (involving movement-based stretching and progressive intensity increases) were superior to static stretching for pre-exercise preparation, showing 23% better acute performance outcomes and 35% greater injury risk reduction.

However, static stretching performed outside of training sessions (e.g., in the evening or as a separate session) was associated with improved flexibility without the acute performance decrements observed when performed immediately before training.

The most effective programs combined all three elements: dynamic warm-ups before training, targeted mobility work for individual limitations, and dedicated flexibility sessions performed separately. Programs that were individualized based on movement screening assessments showed the greatest injury reduction benefits.',
  'Dr. Robert Kim',
  '',
  'injury_prevention',
  ARRAY['mobility', 'injury prevention', 'flexibility', 'warm-up', 'stretching'],
  'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=800',
  '',
  'British Journal of Sports Medicine',
  6,
  false,
  true,
  now() - interval '20 days'
),
(
  'Mindfulness Meditation and Exercise Adherence: A Behavioral Science Perspective',
  'A 24-week intervention study demonstrates that combining mindfulness meditation with exercise programming increases long-term adherence by 47% and improves perceived effort during high-intensity sessions.',
  'Exercise adherence remains one of the biggest challenges in health and fitness. This 24-week randomized controlled trial examined whether integrating mindfulness meditation into exercise programming could improve long-term compliance and exercise experience.

The study involved 180 previously sedentary adults assigned to three groups: exercise only (standard progressive training program), exercise plus mindfulness (same training program with 10-minute pre-session guided meditation), and exercise plus mindfulness with daily practice (same training program with pre-session and daily 15-minute meditation).

At 24 weeks, adherence rates were dramatically different: 52% in the exercise-only group, 71% in the exercise plus pre-session mindfulness group, and 76% in the full mindfulness group. The mindfulness groups also reported significantly lower ratings of perceived exertion during identical workouts.

Mechanistic analysis suggested that mindfulness practice improved interoceptive awareness—the ability to perceive and interpret internal body signals—which helped participants distinguish between productive discomfort and genuine pain signals. This improved body awareness was associated with fewer overuse injuries and more appropriate self-regulation of exercise intensity.

The findings support integrating brief mindfulness practices into fitness programming as a low-cost, evidence-based strategy for improving exercise adherence, particularly for individuals new to regular physical activity.',
  'Dr. Lisa Nakamura',
  '',
  'mental_health',
  ARRAY['mindfulness', 'meditation', 'adherence', 'behavioral science', 'mental health'],
  'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800',
  '',
  'Psychology of Sport and Exercise',
  8,
  false,
  true,
  now() - interval '25 days'
),
(
  'Creatine Beyond Muscle: Cognitive Benefits and Brain Health',
  'New neuroimaging research reveals that creatine supplementation improves working memory by 15% and reduces mental fatigue during cognitively demanding tasks, with implications for both athletes and the general population.',
  'Creatine monohydrate has long been established as one of the most effective and well-researched sports supplements for enhancing physical performance. However, emerging research is revealing significant cognitive benefits that extend well beyond muscle performance.

This double-blind, placebo-controlled study involving 120 participants (60 athletes, 60 non-athletes) examined the effects of 12 weeks of creatine supplementation (5g/day) on cognitive function using standardized neuropsychological testing and functional MRI imaging.

Key cognitive findings included a 15% improvement in working memory tasks, 12% faster processing speed on complex decision-making tasks, and 23% reduction in self-reported mental fatigue during sustained cognitive effort. These benefits were observed in both athlete and non-athlete groups.

Functional MRI imaging revealed increased phosphocreatine availability in prefrontal cortex regions associated with executive function and working memory. The brain, which accounts for approximately 20% of total body energy expenditure despite representing only 2% of body mass, appears to benefit substantially from enhanced creatine stores.

The cognitive benefits were particularly pronounced in conditions of sleep deprivation and acute stress—situations common in both athletic competition and everyday life. Participants supplementing with creatine maintained cognitive performance under sleep-restricted conditions significantly better than placebo groups.

These findings suggest that creatine supplementation may offer dual benefits for athletes: enhanced physical performance and improved cognitive function, particularly during periods of high physical and mental demand.',
  'Dr. David Williams',
  '',
  'supplements',
  ARRAY['creatine', 'cognitive function', 'brain health', 'supplements', 'neuroscience'],
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800',
  '',
  'Frontiers in Neuroscience',
  10,
  false,
  true,
  now() - interval '30 days'
);
