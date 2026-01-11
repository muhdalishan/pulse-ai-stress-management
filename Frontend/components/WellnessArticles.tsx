
import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, Tag, Zap, CheckCircle2, ArrowLeft, BookOpen } from 'lucide-react';

const articles = [
  {
    id: '1',
    title: 'The Neuroscience of Digital Detox',
    excerpt: 'How chronic screen time alters our cortisol levels and what you can do to reset your neural circuitry.',
    category: 'Science',
    readTime: '6 min',
    image: 'https://picsum.photos/seed/detox/800/400',
    content: `
# The Neuroscience of Digital Detox

## Understanding the Digital Stress Response

In our hyperconnected world, our brains are constantly processing digital stimuli. Research shows that excessive screen time triggers a chronic stress response, elevating cortisol levels and disrupting our natural circadian rhythms.

## The Science Behind Screen Addiction

### Dopamine and Digital Rewards
Every notification, like, and message triggers a small dopamine release in our brain's reward center. This creates a feedback loop that keeps us reaching for our devices, even when we don't consciously want to.

### Cortisol and Chronic Stress
Constant digital stimulation keeps our sympathetic nervous system in a state of hyperarousal. This leads to:
- Elevated cortisol levels throughout the day
- Disrupted sleep patterns
- Increased anxiety and irritability
- Reduced ability to focus on single tasks

## Practical Digital Detox Strategies

### 1. Create Digital Boundaries
- Implement "phone-free" zones in your bedroom and dining area
- Use airplane mode during focused work sessions
- Set specific times for checking emails and social media

### 2. Practice Mindful Technology Use
- Before picking up your phone, pause and ask: "What am I looking for?"
- Use the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds
- Replace mindless scrolling with intentional activities

### 3. Optimize Your Digital Environment
- Turn off non-essential notifications
- Use blue light filters, especially in the evening
- Keep your phone in another room while sleeping

## The Recovery Process

When you begin a digital detox, your brain needs time to recalibrate. Expect:
- Initial restlessness and urges to check devices
- Improved focus and creativity after 3-7 days
- Better sleep quality within 1-2 weeks
- Reduced anxiety and improved mood over time

## Building Long-term Digital Wellness

The goal isn't to eliminate technology, but to use it intentionally. Create a sustainable relationship with your devices that supports your mental health and life goals.

Remember: Your attention is your most valuable resource. Protect it wisely.
    `
  },
  {
    id: '2',
    title: 'Ancient Wisdom for a Modern World',
    excerpt: 'Exploring how Stoic principles and Zen practices provide the ultimate psychological armor against stress.',
    category: 'Philosophy',
    readTime: '8 min',
    image: 'https://picsum.photos/seed/wisdom/800/400',
    content: `
# Ancient Wisdom for a Modern World

## The Timeless Nature of Human Stress

While our stressors have evolved from saber-toothed tigers to smartphone notifications, the fundamental human experience of anxiety, uncertainty, and pressure remains unchanged. Ancient philosophical traditions offer profound insights for navigating modern challenges.

## Stoic Principles for Stress Management

### The Dichotomy of Control
The Stoics taught us to distinguish between what we can and cannot control. This simple yet powerful concept can transform how we approach stress:

**What we can control:**
- Our thoughts and interpretations
- Our actions and responses
- Our values and priorities
- Our effort and preparation

**What we cannot control:**
- Other people's actions
- External events and outcomes
- The past and future
- Natural disasters and global events

### Practical Stoic Exercises

#### 1. Morning Reflection
Start each day by asking: "What challenges might I face today, and how can I respond with virtue?"

#### 2. Evening Review
End each day by reflecting: "What did I handle well? What could I improve tomorrow?"

#### 3. Negative Visualization
Occasionally imagine losing what you value most. This practice builds gratitude and resilience.

## Zen Practices for Inner Peace

### Mindfulness and Present-Moment Awareness
Zen teaches us that suffering often comes from dwelling on the past or worrying about the future. By anchoring ourselves in the present moment, we can find peace amidst chaos.

#### The Practice of "Just Sitting" (Shikantaza)
- Sit comfortably with your back straight
- Breathe naturally without trying to control your breath
- When thoughts arise, acknowledge them without judgment and return to sitting
- Start with 5-10 minutes daily

### Acceptance and Non-Resistance
The Zen concept of "what is, is" teaches us to accept reality as it unfolds, rather than fighting against circumstances we cannot change.

## Integrating Ancient Wisdom into Daily Life

### Morning Routine
1. **Stoic Planning**: Identify what you can control today
2. **Zen Breathing**: 5 minutes of mindful breathing
3. **Intention Setting**: Choose your core values for the day

### During Stressful Moments
1. **Pause**: Take three deep breaths
2. **Assess**: What can I control in this situation?
3. **Accept**: What must I accept as it is?
4. **Act**: Take purposeful action aligned with your values

### Evening Practice
1. **Gratitude**: List three things you're grateful for
2. **Reflection**: What did you learn about yourself today?
3. **Release**: Let go of what you cannot control

## The Modern Application

These ancient practices aren't about becoming emotionless or passive. They're about developing:
- **Emotional resilience** in the face of challenges
- **Mental clarity** when making decisions
- **Inner peace** regardless of external circumstances
- **Purposeful action** aligned with your deepest values

In our fast-paced world, these timeless principles offer an anchor of stability and wisdom. They remind us that while we cannot control what happens to us, we always have the power to choose our response.
    `
  },
  {
    id: '3',
    title: 'Precision Nutrition: Fueling Resilience',
    excerpt: 'The gut-brain axis and how specific amino acids can buffer the physical impact of chronic pressure.',
    category: 'Nutrition',
    readTime: '10 min',
    image: 'https://picsum.photos/seed/nutrition/800/400',
    content: `
# Precision Nutrition: Fueling Resilience

## The Gut-Brain Connection

Your gut is often called your "second brain" for good reason. The enteric nervous system in your digestive tract contains over 500 million neurons and produces 90% of your body's serotonin. What you eat directly impacts your mood, stress levels, and cognitive function.

## Understanding the Stress-Nutrition Cycle

### How Stress Affects Digestion
When you're stressed, your body:
- Diverts blood flow away from digestive organs
- Reduces production of digestive enzymes
- Alters gut bacteria composition
- Increases inflammation throughout the body

### How Poor Nutrition Increases Stress
Nutrient deficiencies can:
- Impair neurotransmitter production
- Destabilize blood sugar levels
- Increase inflammatory markers
- Reduce the body's ability to cope with stressors

## Key Nutrients for Stress Resilience

### 1. Magnesium - The Relaxation Mineral
**Why it matters:** Magnesium regulates the nervous system and helps muscles relax.

**Best sources:**
- Dark leafy greens (spinach, Swiss chard)
- Nuts and seeds (almonds, pumpkin seeds)
- Dark chocolate (70% cacao or higher)
- Avocados

**Daily target:** 400-420mg for men, 310-320mg for women

### 2. Omega-3 Fatty Acids - Brain Fuel
**Why it matters:** These essential fats reduce inflammation and support neurotransmitter function.

**Best sources:**
- Fatty fish (salmon, sardines, mackerel)
- Walnuts and flaxseeds
- Chia seeds
- Algae-based supplements (for vegetarians)

**Daily target:** 1-2 grams of combined EPA and DHA

### 3. B-Complex Vitamins - Energy and Mood Support
**Why it matters:** B vitamins are crucial for neurotransmitter synthesis and energy metabolism.

**Key B vitamins for stress:**
- **B6**: Supports GABA production (calming neurotransmitter)
- **B12**: Essential for nervous system function
- **Folate**: Important for serotonin synthesis
- **B5**: Supports adrenal gland function

**Best sources:** Whole grains, legumes, eggs, leafy greens, nutritional yeast

### 4. Amino Acids - Building Blocks of Calm
**L-Theanine:** Found in green tea, promotes relaxation without drowsiness
**Tryptophan:** Precursor to serotonin, found in turkey, eggs, cheese
**GABA:** Calming neurotransmitter, found in fermented foods
**Glycine:** Promotes better sleep, found in bone broth, gelatin

## The Anti-Inflammatory Diet for Stress

### Foods to Emphasize
- **Colorful vegetables**: Rich in antioxidants and phytonutrients
- **Berries**: High in anthocyanins that protect the brain
- **Fatty fish**: Omega-3s and high-quality protein
- **Fermented foods**: Support gut health and microbiome diversity
- **Herbs and spices**: Turmeric, ginger, and garlic have anti-inflammatory properties

### Foods to Limit
- **Processed foods**: High in inflammatory oils and additives
- **Excess sugar**: Causes blood sugar spikes and crashes
- **Refined carbohydrates**: Can trigger inflammatory responses
- **Excessive caffeine**: Can increase cortisol and anxiety
- **Alcohol**: Disrupts sleep and depletes B vitamins

## Meal Timing and Stress Management

### Stabilizing Blood Sugar
- Eat protein with every meal and snack
- Include healthy fats to slow digestion
- Choose complex carbohydrates over simple sugars
- Avoid skipping meals, which can trigger stress hormones

### Strategic Eating for Better Sleep
- Stop eating 2-3 hours before bedtime
- If hungry before bed, choose a small snack with tryptophan
- Limit caffeine after 2 PM
- Consider magnesium supplementation in the evening

## Hydration and Stress

Dehydration, even mild, can increase cortisol levels and impair cognitive function. Aim for:
- 8-10 glasses of water daily
- More if you're active or in hot weather
- Herbal teas count toward fluid intake
- Monitor urine color as a hydration indicator

## Practical Implementation

### Week 1: Foundation
- Add one serving of fatty fish or omega-3 rich foods daily
- Include a magnesium-rich food with each meal
- Replace one processed snack with whole foods

### Week 2: Optimization
- Introduce fermented foods (yogurt, kefir, sauerkraut)
- Add a B-complex supplement if needed
- Focus on meal timing and blood sugar stability

### Week 3: Fine-tuning
- Experiment with stress-reducing herbs (ashwagandha, holy basil)
- Optimize hydration throughout the day
- Consider working with a nutritionist for personalized guidance

## The Long-term Perspective

Nutrition for stress resilience isn't about perfect eating—it's about consistent, nourishing choices that support your body's natural ability to handle life's challenges. Small, sustainable changes compound over time to create significant improvements in your stress response and overall well-being.

Remember: Your body is incredibly adaptive. Give it the right fuel, and it will reward you with greater resilience, clearer thinking, and improved mood.
    `
  },
  {
    id: '4',
    title: 'Biohacking Your Sleep Quality',
    excerpt: 'Beyond basic hygiene: temperature control, magnesium, and the science of deep REM recovery.',
    category: 'Biohacking',
    readTime: '5 min',
    image: 'https://picsum.photos/seed/sleep/800/400',
    content: `
# Biohacking Your Sleep Quality

## The Science of Sleep Optimization

Sleep isn't just rest—it's when your body repairs, consolidates memories, and resets for the next day. Quality sleep is one of the most powerful tools for stress management and cognitive performance.

## Understanding Sleep Architecture

### The Four Stages of Sleep
1. **Stage 1 (Light Sleep)**: Transition from wakefulness
2. **Stage 2 (Light Sleep)**: Body temperature drops, heart rate slows
3. **Stage 3 (Deep Sleep)**: Physical restoration, immune system strengthening
4. **REM Sleep**: Memory consolidation, emotional processing

### Why Deep Sleep Matters
Deep sleep is when:
- Growth hormone is released for tissue repair
- Toxins are cleared from the brain
- Immune system is strengthened
- Stress hormones are regulated

## Advanced Sleep Optimization Strategies

### 1. Temperature Regulation
**The Science:** Your core body temperature naturally drops 1-2°F during sleep. Supporting this process improves sleep quality.

**Optimization techniques:**
- Keep bedroom between 65-68°F (18-20°C)
- Take a warm bath 1-2 hours before bed (causes temperature drop afterward)
- Use breathable, moisture-wicking bedding
- Consider a cooling mattress pad or pillow

### 2. Light Exposure Management
**The Science:** Light exposure regulates your circadian rhythm through melatonin production.

**Morning optimization:**
- Get 10-30 minutes of bright light within 1 hour of waking
- Use a 10,000 lux light therapy lamp if natural light is limited
- Avoid sunglasses during morning light exposure

**Evening optimization:**
- Dim lights 2-3 hours before bedtime
- Use blue light blocking glasses or apps
- Install blackout curtains or use an eye mask
- Avoid screens 1 hour before bed (or use night mode)

### 3. Strategic Supplementation
**Magnesium Glycinate (200-400mg)**
- Promotes muscle relaxation
- Supports GABA function
- Take 1-2 hours before bed

**Melatonin (0.5-3mg)**
- Start with the lowest effective dose
- Take 30-60 minutes before desired sleep time
- Use only for circadian rhythm support, not as a sleep aid

**L-Theanine (100-200mg)**
- Promotes relaxation without sedation
- Enhances alpha brain waves
- Can be combined with magnesium

**Glycine (3g)**
- Lowers core body temperature
- Improves sleep quality
- Take 1 hour before bed

### 4. Sleep Environment Optimization
**Sound management:**
- Use earplugs or white noise machine
- Consider brown noise for deeper frequencies
- Maintain consistent ambient sound levels

**Air quality:**
- Keep humidity between 30-50%
- Use an air purifier if needed
- Ensure adequate ventilation
- Consider plants that produce oxygen at night (snake plant, aloe vera)

## Advanced Biohacking Techniques

### 1. Heart Rate Variability (HRV) Monitoring
Track your autonomic nervous system recovery:
- Use devices like WHOOP, Oura Ring, or HeartMath
- Higher HRV generally indicates better recovery
- Adjust sleep schedule based on HRV trends

### 2. Sleep Tracking and Analysis
Monitor your sleep stages:
- Track deep sleep and REM percentages
- Identify patterns in sleep quality
- Adjust bedtime and wake time based on natural cycles

### 3. Breathwork for Sleep
**4-7-8 Breathing Technique:**
- Inhale for 4 counts
- Hold for 7 counts
- Exhale for 8 counts
- Repeat 4-8 cycles

**Box Breathing:**
- Inhale for 4 counts
- Hold for 4 counts
- Exhale for 4 counts
- Hold for 4 counts

### 4. Strategic Napping
**Power nap guidelines:**
- 10-20 minutes maximum
- Between 1-3 PM only
- Avoid if you have trouble falling asleep at night
- Use caffeine before napping for enhanced alertness afterward

## The Sleep-Stress Connection

### How Poor Sleep Increases Stress
- Elevates cortisol levels
- Impairs emotional regulation
- Reduces cognitive performance
- Weakens immune system

### How Better Sleep Reduces Stress
- Improves stress hormone regulation
- Enhances emotional resilience
- Boosts cognitive function
- Strengthens immune response

## Creating Your Sleep Optimization Protocol

### Week 1: Foundation
- Establish consistent sleep and wake times
- Optimize bedroom temperature and darkness
- Remove screens 1 hour before bed

### Week 2: Enhancement
- Add morning light exposure routine
- Introduce magnesium supplementation
- Implement evening wind-down routine

### Week 3: Advanced Optimization
- Experiment with sleep tracking
- Try breathwork techniques
- Fine-tune supplement timing and dosages

### Week 4: Personalization
- Analyze sleep data and patterns
- Adjust protocol based on what works best
- Consider working with a sleep specialist if needed

## Troubleshooting Common Issues

**Can't fall asleep:**
- Try progressive muscle relaxation
- Use guided meditation apps
- Consider L-theanine supplementation

**Frequent wake-ups:**
- Check room temperature and air quality
- Avoid large meals 3 hours before bed
- Consider magnesium glycinate

**Early morning awakening:**
- Ensure complete darkness
- Check cortisol patterns with healthcare provider
- Avoid alcohol and caffeine late in the day

## The Long-term Benefits

Optimizing your sleep is an investment in:
- Enhanced cognitive performance
- Improved emotional regulation
- Better stress resilience
- Stronger immune function
- Increased longevity

Remember: Sleep optimization is highly individual. What works for others may need adjustment for your unique physiology and lifestyle. Be patient, track your results, and make gradual improvements over time.
    `
  }
];

const WellnessArticles: React.FC<{ addPoints: (amount: number, badge?: string) => void }> = ({ addPoints }) => {
  // Load read articles from localStorage on component mount
  const loadReadArticles = (): string[] => {
    try {
      const savedReadArticles = localStorage.getItem('wellness-read-articles');
      return savedReadArticles ? JSON.parse(savedReadArticles) : [];
    } catch (error) {
      console.error('Error loading read articles:', error);
      return [];
    }
  };

  const [readArticles, setReadArticles] = useState<string[]>(loadReadArticles());
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  // Save read articles to localStorage whenever readArticles changes
  useEffect(() => {
    try {
      localStorage.setItem('wellness-read-articles', JSON.stringify(readArticles));
    } catch (error) {
      console.error('Error saving read articles:', error);
    }
  }, [readArticles]);

  const handleRead = (id: string) => {
    if (readArticles.includes(id)) return;
    setReadArticles(prev => [...prev, id]);
    addPoints(10, readArticles.length + 1 >= 4 ? 'Knowledge Seeker' : undefined);
  };

  const openArticle = (id: string) => {
    setSelectedArticle(id);
    if (!readArticles.includes(id)) {
      handleRead(id);
    }
  };

  const closeArticle = () => {
    setSelectedArticle(null);
  };

  // Function to clear read articles (useful for testing)
  const clearReadArticles = () => {
    setReadArticles([]);
    localStorage.removeItem('wellness-read-articles');
  };

  const selectedArticleData = articles.find(article => article.id === selectedArticle);

  // Article reader view
  if (selectedArticle && selectedArticleData) {
    return (
      <div className="max-w-4xl mx-auto pb-20">
        <div className="mb-8">
          <button
            onClick={closeArticle}
            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Articles
          </button>
          
          <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
            <img 
              src={selectedArticleData.image} 
              alt={selectedArticleData.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-indigo-400 border border-white/10 mb-3">
                {selectedArticleData.category}
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{selectedArticleData.title}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-1"><Clock size={14} /> {selectedArticleData.readTime} read</span>
                <span className="flex items-center gap-1"><BookOpen size={14} /> Article</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10">
          <div className="prose prose-invert prose-indigo max-w-none">
            <div 
              className="text-slate-200 leading-relaxed"
              style={{
                fontSize: '16px',
                lineHeight: '1.7'
              }}
              dangerouslySetInnerHTML={{
                __html: selectedArticleData.content
                  .split('\n')
                  .map(line => {
                    if (line.startsWith('# ')) {
                      return `<h1 class="text-3xl font-bold text-white mb-6 mt-8">${line.substring(2)}</h1>`;
                    } else if (line.startsWith('## ')) {
                      return `<h2 class="text-2xl font-bold text-indigo-300 mb-4 mt-8">${line.substring(3)}</h2>`;
                    } else if (line.startsWith('### ')) {
                      return `<h3 class="text-xl font-bold text-slate-200 mb-3 mt-6">${line.substring(4)}</h3>`;
                    } else if (line.startsWith('#### ')) {
                      return `<h4 class="text-lg font-semibold text-slate-300 mb-2 mt-4">${line.substring(5)}</h4>`;
                    } else if (line.startsWith('**') && line.endsWith('**')) {
                      return `<p class="font-bold text-indigo-200 mb-3">${line.substring(2, line.length - 2)}</p>`;
                    } else if (line.startsWith('- ')) {
                      return `<li class="text-slate-300 mb-1 ml-4">${line.substring(2)}</li>`;
                    } else if (line.trim() === '') {
                      return '<br>';
                    } else {
                      return `<p class="mb-4 text-slate-200">${line}</p>`;
                    }
                  })
                  .join('')
              }}
            />
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                <CheckCircle2 size={18} /> 
                Article Completed (+10 pts)
              </div>
              <button
                onClick={closeArticle}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
              >
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Article grid view
  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-500">
            Knowledge Vault
          </h1>
          <button
            onClick={clearReadArticles}
            className="hidden md:block px-3 py-1 text-xs text-slate-400 hover:text-slate-300 border border-slate-600 hover:border-slate-500 rounded transition-colors"
            title="Clear reading progress"
          >
            Clear Progress
          </button>
        </div>
        <p className="text-slate-400">Expand your cognitive horizon and earn <span className="text-rose-400 font-bold">10 pts</span> per module read.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((article) => (
          <div key={article.id} className="group glass rounded-3xl overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-all flex flex-col shadow-xl">
            <div className="relative h-56 overflow-hidden">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-400 border border-white/10">
                {article.category}
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1"><Clock size={14} /> {article.readTime} read</span>
                <span className="flex items-center gap-1"><Tag size={14} /> Intelligence</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-indigo-400 transition-colors">{article.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">{article.excerpt}</p>
              <div className="mt-auto">
                {readArticles.includes(article.id) ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                      <CheckCircle2 size={18} /> Module Decrypted (+10 pts)
                    </div>
                    <button 
                      onClick={() => openArticle(article.id)}
                      className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-all"
                    >
                      Read Again
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => openArticle(article.id)}
                    className="flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-all"
                  >
                    Read Article <BookOpen size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WellnessArticles;
