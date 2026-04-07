import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const C = {
  bg:"#080808",bg1:"#0f0f0f",bg2:"#141414",bg3:"#1a1a1a",bg4:"#111",
  b1:"#222",b2:"#1c1c1c",b3:"#2a2a2a",b4:"#333",
  t1:"#e8e8e8",t2:"#888",t3:"#555",t4:"#333",
  green:"#166534",gbg:"#0a160a",gb:"#1a4520",
  gold:"#fbbf24",amber:"#78350f",
};

const PHASES = {
  base: {l:"Base",  c:"#a78bfa",d:"#7c3aed",w:"1–5"},
  build:{l:"Build", c:"#34d399",d:"#059669",w:"6–11"},
  peak: {l:"Peak",  c:"#fbbf24",d:"#d97706",w:"12–18"},
  taper:{l:"Taper", c:"#94a3b8",d:"#64748b",w:"19–21"},
};

const RT = {
  easy: {l:"Easy run",       c:"#60a5fa",d:"#3b82f6"},
  long: {l:"Long run",       c:"#c084fc",d:"#9333ea"},
  tempo:{l:"Tempo run",      c:"#fb923c",d:"#ea580c"},
  loop: {l:"Loop sim",       c:"#fcd34d",d:"#f59e0b"},
  nloop:{l:"Night loops",    c:"#818cf8",d:"#6366f1"},
  big50:{l:"50-Mile effort", c:"#fde68a",d:"#eab308"},
  race: {l:"RACE DAY",       c:"#6ee7b7",d:"#10b981"},
  shake:{l:"Shakeout",       c:"#67e8f9",d:"#06b6d4"},
  game: {l:"Game day",       c:"#fcd34d",d:"#d97706"},
  soc:  {l:"Soccer practice",c:"#fb923c",d:"#ea580c"},
  rest: {l:"Rest",           c:"#444",   d:"#333"},
};

const ST = {
  strength: {l:"Strength circuit", c:"#4ade80"},
  stability:{l:"Stability circuit",c:"#2dd4bf"},
  mob:      {l:"Mobility warmup",  c:"#86efac"},
  post:     {l:"Post-run stretch", c:"#5eead4"},
  full:     {l:"Full mobility",    c:"#bbf7d0"},
  light:    {l:"Light stretch",    c:"#a7f3d0"},
  none:     {l:null,               c:null},
};

const REC = {
  sauna:   {l:"Sauna",           c:"#fb923c",bg:"#ea580c18"},
  ice:     {l:"Ice bath",        c:"#60a5fa",bg:"#3b82f618"},
  contrast:{l:"Contrast therapy",c:"#a78bfa",bg:"#7c3aed18"},
};

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ─── DEFAULT SOCCER SCHEDULE ──────────────────────────────────────────────────
// socDays: array of 0-6 (Mon=0..Sun=6) for practices
// gameDay: 0-6 for game day (null = no game yet)
const DEFAULT_SOC = { practiceDays:[0,1,3], gameDay:5, gamesStartWeek:5 };
// Week 5 = first game week (April 18 is a Saturday = index 5)

// ─── BASE WEEK TEMPLATES ──────────────────────────────────────────────────────
// Each day template: [runType, baseMiles, strType, note, isMilestone, rec[]]
// Soccer days get overridden dynamically based on socSchedule
const WEEK_TEMPLATES = [
  {n:1,  phase:"base",  baseMi:14, title:"Easing back in (recovering from illness)",
   tips:"Still getting over the cough — soccer practices this week count as your main cardio. Easy runs only. Skip the ice bath until fully symptom free.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",3,"strength","Easy run — walk if coughing",false,[]],
     ["rest",0,"light","Rest day",false,[]],
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",4,"strength","Easy run",false,[]],
     ["easy",5,"post","First real long run attempt",false,["ice"]],
     ["rest",0,"full","Full mobility — 15 min",false,[]],
   ]},
  {n:2,  phase:"base",  baseMi:18, title:"Build the base, start recovery protocols",
   tips:"First full week of sauna and ice bath. 15 min sauna after Tuesday run, ice bath after Saturday long run. Three soccer practices is significant load — keep runs easy.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",4,"strength","Primary run day",false,["sauna"]],
     ["rest",0,"light","Rest",false,[]],
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",4,"strength","Easy effort",false,[]],
     ["long",8,"post","Long run",false,["ice"]],
     ["rest",0,"full","Full mobility + sauna",false,["sauna"]],
   ]},
  {n:3,  phase:"base",  baseMi:22, title:"First double-digit long run",
   tips:"Three practices plus a 10-miler is a big week. The 10-miler is a milestone — don't go fast. Ice bath immediately after.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",5,"strength","Primary run day",false,["sauna"]],
     ["rest",0,"light","Rest",false,[]],
     ["soc",0,"stability","Soccer practice",false,[]],
     ["easy",5,"strength","Easy effort",false,[]],
     ["long",10,"post","First 10-miler",true,["ice"]],
     ["rest",0,"full","Full mobility",false,["sauna"]],
   ]},
  {n:4,  phase:"base",  baseMi:15, title:"Recovery week — back off completely",
   tips:"Three soccer practices makes this a busier recovery week than usual. Cut the runs right back and let the body adapt.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",3,"light","Easy recovery run",false,[]],
     ["rest",0,"none","Full rest",false,[]],
     ["soc",0,"light","Soccer practice",false,[]],
     ["easy",4,"light","Easy effort only",false,[]],
     ["easy",6,"post","Easy long — no pushing",false,["ice"]],
     ["rest",0,"full","Full mobility",false,["sauna"]],
   ]},
  {n:5,  phase:"base",  baseMi:22, title:"First game week — long run shifts to Sunday",
   tips:"First game Saturday. Sunday long run on game-tired legs is intentional. Welcome to your weekly back-to-back — this is race simulation every single week.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",5,"strength","Primary run day",false,["sauna"]],
     ["rest",0,"light","Rest",false,[]],
     ["soc",0,"stability","Soccer practice",false,[]],
     ["easy",4,"mob","Easy — protect the weekend",false,[]],
     ["game",0,"mob","First game",true,["ice"]],
     ["long",12,"post","Long run on game-tired legs",true,["contrast"]],
   ]},
  {n:6,  phase:"build", baseMi:26, title:"Build phase — tempo work begins",
   tips:"Tempo runs start. Comfortably hard — short sentences only. 7:20/mi target. Three practices plus a long Sunday is serious load.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["tempo",5,"strength","Tempo run — 7:20/mi",false,["sauna"]],
     ["rest",0,"light","Rest",false,[]],
     ["soc",0,"stability","Soccer practice",false,[]],
     ["easy",4,"mob","REST — protect weekend",false,[]],
     ["game",0,"mob","Game day",false,["ice"]],
     ["long",15,"post","15 miles — new longest run",true,["contrast"]],
   ]},
  {n:7,  phase:"build", baseMi:28, title:"Building endurance",
   tips:"Sunday long run is the most important session of the week. Protect it above everything. Game Saturday + long Sunday = genuine race prep.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",6,"strength","Easy effort",false,["sauna"]],
     ["rest",0,"light","Rest",false,[]],
     ["soc",0,"stability","Soccer practice",false,[]],
     ["easy",5,"mob","Easy — big weekend ahead",false,[]],
     ["game",0,"mob","Game day",false,["ice"]],
     ["long",16,"post","16 miles",false,["contrast"]],
   ]},
  {n:8,  phase:"build", baseMi:22, title:"Recovery week",
   tips:"Don't skip contrast therapy Sunday — alternating hot/cold on a recovery week resets connective tissue powerfully.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",5,"light","Easy effort",false,[]],
     ["rest",0,"none","Full rest",false,[]],
     ["soc",0,"light","Soccer practice",false,[]],
     ["rest",0,"mob","Rest",false,[]],
     ["game",0,"mob","Game day",false,["ice"]],
     ["long",12,"post","Easy long — no pushing",false,["contrast"]],
   ]},
  {n:9,  phase:"build", baseMi:32, title:"First loop simulation",
   tips:"After Sunday's long run, do 6-8 loops of 1.1mi with 10 min seated rest between. Practice sitting down, eating, getting back up. That discipline saves you at mile 60.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",7,"strength","Primary run day",false,["sauna"]],
     ["rest",0,"light","Rest",false,[]],
     ["soc",0,"stability","Soccer practice",false,[]],
     ["easy",5,"mob","Easy — big weekend ahead",false,[]],
     ["game",0,"mob","Game day",false,["ice"]],
     ["loop",null,"post","Long run + 6-8x loop sim (1.1mi + 10min rest)",true,["contrast"]],
   ]},
  {n:10, phase:"build", baseMi:35, title:"First night run",
   tips:"Night run this week. Set alarm for 10pm Thursday — your body at 2am race day needs to know this is possible.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",8,"strength","Primary run day",false,["sauna"]],
     ["rest",0,"light","Rest",false,[]],
     ["soc",0,"stability","RUN AT 10PM tonight",true,[]],
     ["easy",5,"mob","Easy",false,[]],
     ["game",0,"mob","Game day",false,["ice"]],
     ["long",20,"post","20 miles — major milestone",true,["contrast"]],
   ]},
  {n:11, phase:"build", baseMi:26, title:"Recovery + easy loop sim",
   tips:"Recovery week. 6 easy loops Sunday at conversation pace — practice the reset, not the fitness.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",6,"light","Easy effort",false,[]],
     ["rest",0,"none","Full rest",false,[]],
     ["soc",0,"light","Soccer practice",false,[]],
     ["rest",0,"mob","Rest",false,[]],
     ["game",0,"mob","Game day",false,["ice"]],
     ["loop",null,"post","6x easy loops",false,["contrast"]],
   ]},
  {n:12, phase:"peak",  baseMi:38, title:"Peak phase begins — the real work starts",
   tips:"Peak phase. Everything from here to week 18 is the hardest training you'll do. 8+ hours sleep every night — non-negotiable.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",9,"strength","Primary run day",false,["sauna"]],
     ["rest",0,"light","Rest",false,[]],
     ["soc",0,"stability","Soccer practice",false,[]],
     ["easy",6,"mob","Easy — big weekend",false,[]],
     ["game",0,"mob","Game — wear race shoes",true,["ice"]],
     ["long",22,"post","22 miles",true,["contrast"]],
   ]},
  {n:13, phase:"peak",  baseMi:40, title:"Night loop simulation",
   tips:"6 loops starting 11pm Saturday night, then sleep, then Sunday long run. Closest thing to race conditions you'll experience.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",9,"strength","Primary run day",false,["sauna"]],
     ["rest",0,"light","Rest",false,[]],
     ["soc",0,"stability","Soccer practice",false,[]],
     ["easy",6,"mob","Easy",false,[]],
     ["nloop",null,"mob","6x loops starting 11pm",true,["ice"]],
     ["long",24,"post","Long run after night loops",true,["contrast"]],
   ]},
  {n:14, phase:"peak",  baseMi:30, title:"Recovery week",
   tips:"Third peak recovery. Adaptations from weeks 12–13 are consolidating. These recovery weeks are mandatory.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",7,"light","Easy effort",false,[]],
     ["rest",0,"none","Full rest",false,[]],
     ["soc",0,"light","Soccer practice",false,[]],
     ["rest",0,"mob","Rest",false,[]],
     ["game",0,"mob","Game day",false,["ice"]],
     ["loop",null,"post","6x easy loops + 12mi run",false,["contrast"]],
   ]},
  {n:15, phase:"peak",  baseMi:44, title:"THE 50-MILE EFFORT",
   tips:"Start Sunday at 5am. You will hit a wall at hours 6-8. That wall IS the workout. You survived Whitney on will alone. Call on it here.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",4,"strength","Short easy run",false,[]],
     ["rest",0,"none","Rest",false,[]],
     ["soc",0,"stability","Soccer practice",false,[]],
     ["rest",0,"mob","REST — eat big, sleep early",false,[]],
     ["game",0,"mob","Game — conserve. Big day tomorrow.",false,["ice"]],
     ["big50",50,"post","50-MILE EFFORT. ~10 hrs. This changes you.",true,["contrast"]],
   ]},
  {n:16, phase:"peak",  baseMi:46, title:"Full race simulation",
   tips:"Wear race gear. Eat race food. Find out what doesn't work NOW, not Aug 15.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",9,"strength","Primary run day",false,["sauna"]],
     ["rest",0,"light","Rest",false,[]],
     ["soc",0,"stability","Soccer practice",false,[]],
     ["rest",0,"mob","REST",false,[]],
     ["game",0,"mob","Game — race gear, race nutrition",true,["ice"]],
     ["loop",null,"post","16x loops — race pace, race mindset",true,["contrast"]],
   ]},
  {n:17, phase:"peak",  baseMi:34, title:"Recovery + nutrition focus",
   tips:"Focus obsessively on nutrition and sleep. 8+ hrs every night. Practice exact race-day food Sunday.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",8,"light","Easy effort",false,[]],
     ["rest",0,"none","Full rest",false,[]],
     ["soc",0,"light","Soccer practice",false,[]],
     ["rest",0,"mob","REST — sleep 9hrs",false,[]],
     ["game",0,"mob","Game day",false,["ice"]],
     ["long",20,"post","20 miles with race nutrition",false,["contrast"]],
   ]},
  {n:18, phase:"peak",  baseMi:49, title:"Peak week — the summit of training",
   tips:"Your hardest week. Everything this week goes directly into the bank for August 15. Saturday game + Sunday overnight loops is the hardest back-to-back of the plan.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",9,"strength","Primary run day",false,["sauna"]],
     ["rest",0,"light","Rest",false,[]],
     ["soc",0,"stability","Soccer practice",false,[]],
     ["rest",0,"mob","REST — everything for the weekend",false,[]],
     ["game",0,"mob","Game — race gear on",true,["ice"]],
     ["nloop",null,"post","20x overnight loops. Start 9pm. Run into the night.",true,["contrast"]],
   ]},
  {n:19, phase:"taper", baseMi:40, title:"Taper begins — protect what you built",
   tips:"Taper madness is real. Your legs will feel heavy, fitness feels like it's disappearing. It isn't. Trust the work.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",9,"strength","Keep intensity, reduce volume",false,["sauna"]],
     ["rest",0,"light","Rest",false,[]],
     ["soc",0,"stability","Soccer practice",false,[]],
     ["easy",6,"mob","Easy",false,[]],
     ["game",0,"mob","Game — taper effort",false,["ice"]],
     ["long",18,"post","18 miles — last long run",false,["contrast"]],
   ]},
  {n:20, phase:"taper", baseMi:28, title:"Final sharpening week",
   tips:"No heroics. No junk miles. Sleep 9+ hours every night. Eat more than you think you need.",
   days:[
     ["soc",0,"mob","Soccer practice",false,[]],
     ["easy",6,"light","Easy effort",false,[]],
     ["rest",0,"none","Rest",false,[]],
     ["soc",0,"light","Soccer practice",false,[]],
     ["easy",4,"mob","Easy",false,[]],
     ["game",0,"mob","Game — healthy above all",false,["ice"]],
     ["long",14,"post","14 miles easy",false,["contrast"]],
   ]},
  {n:21, phase:"taper", baseMi:9,  title:"Race week — trust everything",
   tips:"Five months of work. You came to Whitney unprepared and survived on will. This time you show up with both. Aug 8 game is already skipped. You are in lockdown mode.",
   days:[
     ["shake",3,"mob","Easy shakeout",false,[]],
     ["shake",3,"mob","Easy shakeout",false,[]],
     ["shake",3,"light","Last run before the race",false,[]],
     ["rest",0,"none","TOTAL REST — legs up",false,[]],
     ["rest",0,"none","TOTAL REST — travel, gear check",false,[]],
     ["race",100,"none","AUG 15 — 100 MILES",true,[]],
     ["rest",0,"none","You just did something most people will never do.",false,[]],
   ]},
];

// ─── SESSION LIBRARY ──────────────────────────────────────────────────────────
const SESSIONS = {
  strength:{l:"Strength Circuit",when:"~25 min",c:"#a78bfa",d:"#7c3aed",
    tag:"Builds the muscles that protect your knees for 30 hours",
    rest:"60–90 sec",total:"~25 min",equip:"Step/box · optional dumbbells",
    exercises:[
      {name:"Single-leg Romanian deadlift",sets:"3×10 each leg",tempo:"2 sec down, 1 hold, 1 up",
       cue:"Hinge at hip, back flat, free leg straight behind. Feel hamstring stretch. Don't let hips rotate open.",
       why:"Hamstrings and glutes absorb shock behind the knee. When they fatigue at mile 50, the joint takes the full load.",
       prog:"Wks 1–5: bodyweight. Wks 6–11: dumbbell opposite hand. Wks 12+: heavier or 3-sec lowering.",
       url:"https://www.youtube.com/results?search_query=single+leg+romanian+deadlift+form"},
      {name:"Eccentric step-down",sets:"3×12 each leg",tempo:"3-second lowering — this is the point",
       cue:"Stand on step, one foot. Lower other heel over 3 full seconds. Touch lightly. Knee tracks over second toe.",
       why:"Best evidence-based exercise for runner's knee. If you do one thing, make it this.",
       prog:"Wks 1–5: bodyweight. Wks 6+: light weight. Wks 12+: 4-sec lowering.",
       url:"https://www.youtube.com/results?search_query=eccentric+step+down+runners+knee"},
      {name:"Bulgarian split squat",sets:"3×8 each leg",tempo:"Controlled down, drive through heel",
       cue:"Rear foot elevated. Front foot forward so shin stays vertical. Lower until rear knee nearly touches floor.",
       why:"Single-leg strength under load — closest gym exercise to running on hour-20 legs.",
       prog:"Wks 1–5: bodyweight. Wks 6+: dumbbells. Wks 12+: heavier or 2-sec pause.",
       url:"https://www.youtube.com/results?search_query=bulgarian+split+squat+form"},
      {name:"Single-leg calf raise (off step)",sets:"3×15 each leg",tempo:"2 up, 1 hold, 2 down",
       cue:"Stand on edge of step one foot, heel hanging. Full range — all the way down, all the way up.",
       why:"Calves absorb 3x body weight per stride. Weak calves shift load directly to the knee.",
       prog:"Wks 1–5: bodyweight. Wks 8+: dumbbell same side.",
       url:"https://www.youtube.com/results?search_query=single+leg+calf+raise+eccentric"},
    ]},
  stability:{l:"Stability Circuit",when:"~20 min",c:"#2dd4bf",d:"#0d9488",
    tag:"Trains your knee to track straight when fatigued at 3am",
    rest:"45–60 sec",total:"~20 min",equip:"Mini band · step/box",
    exercises:[
      {name:"Lateral band walks",sets:"3×20 steps each direction",tempo:"Slow — don't let band snap",
       cue:"Band around ankles, slight squat, constant tension. Don't let knees cave inward.",
       why:"Activates gluteus medius — prevents knee valgus. #1 mechanical cause of knee breakdown in ultras.",
       prog:"Wks 1–5: light band. Wks 8+: medium. Wks 14+: heavy or add squat pulse.",
       url:"https://www.youtube.com/results?search_query=lateral+band+walks+glute+runner"},
      {name:"Single-leg balance, eyes closed",sets:"3×30 sec each leg",tempo:"Hold still — wobbling is the workout",
       cue:"One foot, soft knee bend, eyes closed, grip floor with toes.",
       why:"Trains proprioception. After 20 hours running, this function degrades badly.",
       prog:"Wks 1–5: flat ground. Wks 8+: folded towel. Wks 14+: squat pulses.",
       url:"https://www.youtube.com/results?search_query=single+leg+balance+proprioception"},
      {name:"Lateral step-down",sets:"3×10 each leg",tempo:"4-second lowering — painfully slow",
       cue:"Sideways on 6-8in box. Lower outside foot over 4 full seconds. Knee tracks over second toe.",
       why:"If your knee wobbles here it will collapse at mile 70.",
       prog:"Wks 1–5: 6in step. Wks 8+: higher box. Wks 12+: dumbbell.",
       url:"https://www.youtube.com/results?search_query=lateral+step+down+knee+stability"},
      {name:"Glute bridge 2-sec hold",sets:"3×15",tempo:"Drive up, hold 2 sec, lower controlled",
       cue:"Feet flat, 90° knees. Drive through heels. Squeeze glutes hard at top.",
       why:"Keeps pelvis stable while running. Dropping pelvis = IT band syndrome.",
       prog:"Wks 1–5: double-leg. Wks 6+: single-leg. Wks 12+: band above knees.",
       url:"https://www.youtube.com/results?search_query=glute+bridge+runner+form"},
    ]},
  mob:{l:"Mobility Warmup",when:"Before every run · ~8 min",c:"#86efac",d:"#16a34a",
    tag:"Two minutes here prevents hours of pain later",
    rest:"No rest",total:"~8 min",equip:"None",
    exercises:[
      {name:"World's greatest stretch",sets:"5 reps each side",tempo:"Slow, 2-3 sec each position",
       cue:"Deep lunge. Same-side hand inside front foot. Rotate top arm to ceiling. Push knee out with elbow.",
       why:"Opens hip flexors, thoracic spine, groin and ankle in one movement.",
       prog:"Same throughout. Deepen the lunge over weeks.",
       url:"https://www.youtube.com/results?search_query=worlds+greatest+stretch"},
      {name:"Hip circles — leg swings",sets:"10 fwd/back + 10 side-to-side each leg",tempo:"Controlled swing",
       cue:"Hold wall. Swing one leg through full range, relaxed.",
       why:"Lubricates hip joint. Tight hips = misaligned knee tracking.",
       prog:"Same throughout.",
       url:"https://www.youtube.com/results?search_query=leg+swings+hip+mobility+runner"},
      {name:"Ankle circles + dorsiflexion",sets:"10 circles each direction + 10 knee-over-toe rocks",tempo:"Slow",
       cue:"Circles: full range. Rocks: push knee forward over toes without heel rising.",
       why:"Restricted ankle mobility forces knee to collapse inward every stride.",
       prog:"Goal: knee further past toes each week.",
       url:"https://www.youtube.com/results?search_query=ankle+dorsiflexion+drill+runner"},
    ]},
  post:{l:"Post-run Stretch",when:"After every long run · ~10 min",c:"#5eead4",d:"#0891b2",
    tag:"Do this while tissue is warm — it makes the difference",
    rest:"No rest",total:"~10 min",equip:"None",
    exercises:[
      {name:"Figure-4 glute stretch",sets:"2 min each side",tempo:"Static hold — breathe into it",
       cue:"Lie on back. Cross one ankle over opposite knee. Pull both legs toward chest.",
       why:"Tight glutes drag the IT band across the knee. IT band syndrome is a top ultra DNF cause.",
       prog:"Deepen the pull over weeks.",
       url:"https://www.youtube.com/results?search_query=figure+four+glute+stretch"},
      {name:"Hip flexor couch stretch",sets:"2 min each side",tempo:"Deepen after 30 sec",
       cue:"Kneel with shin against couch. TUCK YOUR PELVIS — most people miss this.",
       why:"Most skipped, most important stretch for runners.",
       prog:"Wks 1–8: floor. Wks 9+: shin higher on couch.",
       url:"https://www.youtube.com/results?search_query=couch+stretch+hip+flexor"},
      {name:"Standing quad stretch",sets:"60 sec each side",tempo:"Static hold",
       cue:"Pull heel to glute. Keep knees together. Tuck pelvis.",
       why:"Relieves quad compression. Reduces post-run knee soreness.",
       prog:"Same throughout.",
       url:"https://www.youtube.com/results?search_query=standing+quad+stretch+runner"},
    ]},
  full:{l:"Full Mobility",when:"Sunday · ~15 min",c:"#bbf7d0",d:"#15803d",
    tag:"Weekly tissue reset — do consistently and joints thank you by week 12",
    rest:"No rest",total:"~15 min",equip:"None",
    exercises:[
      {name:"Figure-4 glute stretch",sets:"2.5 min each side",tempo:"Breathe deeper every minute",
       cue:"Same as post-run but longer. Second minute is where real tissue change happens.",
       why:"Longer hold = lasting tissue change.",
       prog:"Deepen over weeks.",
       url:"https://www.youtube.com/results?search_query=figure+four+glute+stretch+deep"},
      {name:"Hip flexor couch stretch",sets:"2.5 min each side",tempo:"Sink 5% deeper every 30 sec",
       cue:"At 90 sec, tuck pelvis further. Breathe, let gravity work.",
       why:"This full Sunday hold actually shifts hip flexor length over 21 weeks.",
       prog:"Shin higher on couch over weeks.",
       url:"https://www.youtube.com/results?search_query=couch+stretch+long+hold"},
      {name:"Child's pose with side reach",sets:"90 sec center + 60 sec each side",tempo:"Slow breathing",
       cue:"Kneel, sit back, arms forward. Walk arms to one side.",
       why:"Decompresses lumbar spine after a week of miles.",
       prog:"Same throughout.",
       url:"https://www.youtube.com/results?search_query=childs+pose+side+reach"},
      {name:"Seated soleus stretch",sets:"90 sec each ankle",tempo:"Static, knee bent",
       cue:"Sit on floor, leg bent. Pull toes toward shin. Keep knee bent — deep calf.",
       why:"#1 overlooked cause of Achilles and knee issues in high-mileage running.",
       prog:"Toes closer to shin each week.",
       url:"https://www.youtube.com/results?search_query=seated+soleus+stretch"},
      {name:"Thread the needle — thoracic rotation",sets:"10 reps each side",tempo:"Slow, full reach",
       cue:"On hands and knees. Arm sweeps under body, rotating thoracic spine. Follow with eyes.",
       why:"Upper back stiffness causes altered running mechanics.",
       prog:"Increase range over weeks.",
       url:"https://www.youtube.com/results?search_query=thread+needle+thoracic+rotation"},
    ]},
  light:{l:"Light Stretch",when:"Recovery days · ~5 min",c:"#a7f3d0",d:"#059669",
    tag:"Recovery weeks are where fitness is built — don't add intensity",
    rest:"None",total:"~5 min",equip:"None",
    exercises:[
      {name:"Standing hip flexor stretch",sets:"60 sec each side",tempo:"Gentle hold only",
       cue:"Light lunge, rear knee down. Soft pelvic tuck. Intentionally gentle.",
       why:"Keeps tissue loose without adding training stress.",
       prog:"Same throughout.",
       url:"https://www.youtube.com/results?search_query=standing+hip+flexor+stretch+gentle"},
      {name:"Supine figure-4",sets:"90 sec each side",tempo:"Completely passive",
       cue:"Lie on back, cross ankle over knee. Let it hang — gravity does the work.",
       why:"Maintains glute and IT band length during recovery.",
       prog:"Same throughout.",
       url:"https://www.youtube.com/results?search_query=supine+figure+four+passive"},
      {name:"Ankle circles",sets:"20 each direction each ankle",tempo:"Slow, full range",
       cue:"Trace the biggest circle with your toes.",
       why:"Prevents ankle stiffness during reduced mileage weeks.",
       prog:"Same throughout.",
       url:"https://www.youtube.com/results?search_query=ankle+circles+mobility"},
    ]},
};

const REC_PROTOCOLS = {
  sauna:{title:"Sauna Protocol",subtitle:"Heat adaptation + cardiovascular recovery",
    c:"#fb923c",bg:"#ea580c12",start:"Week 2",
    url:"https://www.youtube.com/results?search_query=huberman+sauna+protocol+athletes",
    specs:[{l:"Temperature",v:"170–190°F"},{l:"Duration",v:"15–20 min"},{l:"Frequency",v:"3–4x/week"},{l:"Timing",v:"Within 1hr post-workout"}],
    when:[{day:"Tuesday",detail:"15 min after easy run + strength."},{day:"Sunday",detail:"20 min on rest day."},{day:"Pre-game Monday",detail:"15 min if legs heavy. Before practice, not after."}],
    benefits:["Increases plasma volume — more blood to working muscles","Growth hormone spike during and after","Improves cardiovascular efficiency","Accelerates connective tissue recovery","Mental hardening — discomfort tolerance training"],
    rules:["NOT when sick","NOT within 4hrs of ice bath (unless contrast)","Hydrate: 16–20oz before","Exit if dizzy or heart racing"],
  },
  ice:{title:"Ice Bath Protocol",subtitle:"Inflammation reduction + connective tissue recovery",
    c:"#60a5fa",bg:"#3b82f612",start:"Week 2",
    url:"https://www.youtube.com/results?search_query=ice+bath+cold+immersion+protocol+recovery",
    specs:[{l:"Temperature",v:"50–59°F"},{l:"Duration",v:"10–12 min"},{l:"Frequency",v:"1–2x/week"},{l:"Timing",v:"Within 30 min of finishing"}],
    when:[{day:"After runs/games",detail:"10–12 min immediately after. Always after, never before."},{day:"Saturday post-game",detail:"Most important ice bath of the week."}],
    benefits:["Dramatically reduces DOMS","Speeds connective tissue recovery","Reduces systemic inflammation","Mental toughness training"],
    rules:["ALWAYS after exercise, never before","Cold tap water + 2-3 bags ice","Ease in — feet first, then legs, then waist","Set a timer","NOT when sick"],
  },
  contrast:{title:"Contrast Therapy",subtitle:"Most powerful recovery tool — save it for Sundays",
    c:"#a78bfa",bg:"#7c3aed12",start:"Week 5",
    url:"https://www.youtube.com/results?search_query=contrast+therapy+sauna+cold+plunge+athletes",
    specs:[{l:"Full protocol",v:"10min hot → 3min cold × 2"},{l:"Shower version",v:"3min hot → 30sec cold × 4"},{l:"Frequency",v:"Once/week Sunday"},{l:"Total time",v:"~26 min"}],
    when:[{day:"Sunday post-long run",detail:"Every game week from week 5. Accelerates recovery for the full week ahead."}],
    benefits:["Flushes metabolic waste from muscle tissue","Reduces next-day fatigue — Monday practice feels better","Best single recovery tool for high-frequency training","Trains nervous system stress response"],
    rules:["Always end on cold — that's where the hormonal spike comes from","No sauna? Use the shower version","Not when sick or core temp elevated","Eat and hydrate before — don't do it depleted"],
  },
};

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const STORE_KEY = "brigham_plan_v5";

const defaultStore = () => ({
  completed:{}, actual:{}, rpe:{}, dayNotes:{}, weekNotes:{},
  socSchedule: DEFAULT_SOC,
  // actualMi[weekN][dayI] = user-entered actual miles
  // planMiOverride[weekN][dayI] = user-edited plan target
});

const useStore = () => {
  const [data, setData] = useState(defaultStore());
  const timer = useRef(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setData({...defaultStore(), ...JSON.parse(raw)});
    } catch(e) {}
  }, []);
  const save = useCallback((next) => {
    setData(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch(e) {}
    }, 400);
  }, []);
  return [data, save];
};

// ─── COMPUTE WEEK DATA ────────────────────────────────────────────────────────
// Takes a template week and soccer schedule, returns computed days array
function computeWeek(tmpl, socSchedule, planOverrides) {
  const { practiceDays, gameDay, gamesStartWeek } = socSchedule;
  const isGameWeek = tmpl.n >= gamesStartWeek && gameDay !== null;
  const days = tmpl.days.map((d, i) => {
    const [runType, baseMi, strType, note, isMilestone, rec] = d;
    // Check if this day index is a soccer practice day
    const isPractice = practiceDays.includes(i);
    // Check if this day index is game day (only in game weeks)
    const isGame = isGameWeek && i === gameDay;

    let finalRunType = runType;
    let finalMi = baseMi;
    let finalStr = strType;
    let finalNote = note;
    let finalRec = rec;

    if (isPractice && runType === "soc") {
      finalRunType = "soc";
    } else if (isGame && runType !== "race" && runType !== "shake") {
      finalRunType = "game";
      finalMi = 0;
      finalRec = ["ice"];
    }

    // Apply plan override if set
    if (planOverrides?.[tmpl.n]?.[i] !== undefined) {
      finalMi = planOverrides[tmpl.n][i];
    }

    return [finalRunType, finalMi, finalStr, finalNote, isMilestone, finalRec];
  });

  // Calculate total running miles for this week
  const totalMi = days.reduce((s, d) => s + (d[1] || 0), 0);

  return { ...tmpl, isGameWeek, days, totalMi };
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const NavBtn = ({label, disabled, onClick}) => (
  <button onClick={onClick} disabled={disabled}
    style={{background:"none",border:`1px solid ${C.b3}`,borderRadius:6,
      color:disabled?C.t4:C.t2,padding:"5px 10px",cursor:disabled?"default":"pointer",
      opacity:disabled?0.3:1,fontSize:12}}>
    {label}
  </button>
);

const RecPill = ({type}) => {
  const t = REC[type]; if (!t) return null;
  return <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"1px 7px",
    borderRadius:10,fontSize:10,fontWeight:500,background:t.bg,color:t.c}}>
    <span style={{fontSize:9}}>●</span> {t.l}
  </span>;
};

const Field = ({label,val,small}) => (
  <div style={{marginBottom:10}}>
    <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",color:C.t4,marginBottom:3,fontWeight:600}}>{label}</div>
    <div style={{fontSize:small?11:12,color:"#999",lineHeight:1.6}}>{val}</div>
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("schedule");
  const [weekNum, setWeekNum] = useState(null);
  const [sessKey, setSessKey] = useState("strength");
  const [recKey, setRecKey] = useState("sauna");
  const [store, save] = useStore();

  const soc = store.socSchedule || DEFAULT_SOC;
  const planOverrides = store.planMiOverride || {};

  const weeks = WEEK_TEMPLATES.map(t => computeWeek(t, soc, planOverrides));

  const totalWorkouts = weeks.reduce((a,w) => a + w.days.filter(d=>d[0]!=="rest").length, 0);
  const doneCount = Object.values(store.completed||{}).filter(Boolean).length;
  const pct = Math.round((doneCount/totalWorkouts)*100);
  const daysLeft = Math.max(0, Math.ceil((new Date("2026-08-15")-new Date())/86400000));

  const openSession = (key) => { setSessKey(key); setTab("sessions"); };
  const setSoc = (next) => save({...store, socSchedule:next});
  const setPlanOverride = (weekN, dayI, mi) => {
    const cur = store.planMiOverride || {};
    const wk = {...(cur[weekN]||{})};
    if (mi === null) { delete wk[dayI]; } else { wk[dayI] = mi; }
    save({...store, planMiOverride:{...cur,[weekN]:wk}});
  };

  return (
    <div style={{background:C.bg,minHeight:"100vh",color:C.t1,fontFamily:"system-ui,-apple-system,sans-serif"}}>
      {/* Header */}
      <div style={{background:C.bg1,borderBottom:`1px solid ${C.b2}`,padding:"16px 20px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:10,letterSpacing:"0.14em",color:C.t3,textTransform:"uppercase",marginBottom:2}}>100-Mile Backyard Ultra · Training Plan</div>
            <div style={{fontSize:19,fontWeight:700,letterSpacing:"-0.02em",color:"#fff"}}>August 15, 2026</div>
            <div style={{fontSize:11,color:C.t3,marginTop:2}}>21 weeks · Running + Soccer + Strength + Recovery</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:36,fontWeight:700,color:C.gold,lineHeight:1}}>{daysLeft}</div>
            <div style={{fontSize:10,color:C.t3,textTransform:"uppercase",letterSpacing:"0.08em"}}>days to race</div>
          </div>
        </div>
        <div style={{marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:11,color:C.t3}}>Progress</span>
            <span style={{fontSize:11,color:C.t2}}>{doneCount} / {totalWorkouts} · {pct}%</span>
          </div>
          <div style={{height:3,background:C.b3,borderRadius:2}}>
            <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#7c3aed,#fbbf24)",borderRadius:2,transition:"width 0.4s"}}/>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{display:"flex",background:C.bg2,borderBottom:`1px solid ${C.b2}`,overflowX:"auto"}}>
        {[["schedule","Schedule"],["sessions","Sessions"],["recovery","Recovery"],["soccer","Soccer"],["notes","Notes"]].map(([k,l])=>(
          <button key={k} onClick={()=>{setTab(k);if(k==="schedule")setWeekNum(null);}}
            style={{padding:"10px 14px",background:"none",border:"none",
              borderBottom:`2px solid ${tab===k?"#7c3aed":"transparent"}`,
              color:tab===k?"#a78bfa":C.t3,fontSize:12,cursor:"pointer",
              fontWeight:tab===k?600:400,whiteSpace:"nowrap"}}>
            {l}
          </button>
        ))}
      </div>

      {tab==="schedule" && <ScheduleView weekNum={weekNum} setWeekNum={setWeekNum}
        weeks={weeks} store={store} save={save} openSession={openSession} setPlanOverride={setPlanOverride}/>}
      {tab==="sessions" && <SessionsView sessKey={sessKey} setSessKey={setSessKey}/>}
      {tab==="recovery" && <RecoveryView recKey={recKey} setRecKey={setRecKey}/>}
      {tab==="soccer"   && <SoccerView soc={soc} setSoc={setSoc} weeks={weeks}/>}
      {tab==="notes"    && <NotesView store={store} save={save} weeks={weeks}/>}
    </div>
  );
}

// ─── SCHEDULE VIEW ────────────────────────────────────────────────────────────
function ScheduleView({weekNum,setWeekNum,weeks,store,save,openSession,setPlanOverride}) {
  if (weekNum) {
    const w = weeks[weekNum-1];
    return <WeekView week={w} store={store} save={save} openSession={openSession}
      setPlanOverride={setPlanOverride}
      onBack={()=>setWeekNum(null)}
      onPrev={()=>setWeekNum(Math.max(1,weekNum-1))}
      onNext={()=>setWeekNum(Math.min(21,weekNum+1))}/>;
  }
  return <WeekGrid weeks={weeks} store={store} onSelect={setWeekNum}/>;
}

function WeekGrid({weeks,store,onSelect}) {
  return (
    <div style={{padding:"18px 20px"}}>
      <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:`1px solid ${C.b2}`,marginBottom:18}}>
        {Object.entries(PHASES).map(([k,p])=>(
          <div key={k} style={{flex:1,padding:"7px 8px",borderRight:`1px solid ${C.b2}`,display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:p.d,flexShrink:0}}/>
            <div>
              <div style={{fontSize:10,fontWeight:600,color:p.c}}>{p.l}</div>
              <div style={{fontSize:9,color:C.t4}}>Wks {p.w}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(128px,1fr))",gap:7}}>
        {weeks.map(w=>{
          const p=PHASES[w.phase];
          const active=w.days.filter(d=>d[0]!=="rest");
          const done=active.filter((_,i)=>!!store.completed?.[`${w.n}-${w.days.indexOf(active[i])}`]).length;
          const allDone=active.length>0&&done===active.length;
          const wpct=active.length>0?Math.round(done/active.length*100):0;
          const hasMile=w.days.some(d=>d[4]);
          return (
            <button key={w.n} onClick={()=>onSelect(w.n)}
              style={{background:allDone?C.gbg:C.bg4,border:`1px solid ${allDone?C.gb:C.b2}`,
                borderRadius:8,padding:"10px",cursor:"pointer",textAlign:"left",
                position:"relative",width:"100%",transition:"border-color 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=p.d}
              onMouseLeave={e=>e.currentTarget.style.borderColor=allDone?C.gb:C.b2}>
              {allDone
                ?<div style={{position:"absolute",top:7,right:7,width:13,height:13,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#fff"}}>✓</div>
                :hasMile&&<div style={{position:"absolute",top:8,right:8,width:5,height:5,borderRadius:"50%",background:C.gold}}/>
              }
              <div style={{fontSize:9,color:p.c,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>● {p.l}</div>
              <div style={{fontSize:16,fontWeight:700,color:"#fff",margin:"0 0 2px"}}>W{w.n}</div>
              <div style={{fontSize:9,color:C.t2,lineHeight:1.3,marginBottom:6}}>{w.title.length>30?w.title.slice(0,30)+"…":w.title}</div>
              <div style={{fontSize:11,color:p.c,fontWeight:600}}>
                {w.n===21?"Race":w.isGameWeek?`${w.totalMi}mi+game`:`${w.totalMi}mi`}
              </div>
              <div style={{marginTop:5,height:2,background:C.b2,borderRadius:1}}>
                <div style={{height:"100%",width:`${wpct}%`,background:p.d,borderRadius:1}}/>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({week,store,save,openSession,setPlanOverride,onBack,onPrev,onNext}) {
  const [expandedDay,setExpandedDay] = useState(null);
  const p = PHASES[week.phase];

  const toggle  =(di)=>{ const k=`${week.n}-${di}`; save({...store,completed:{...store.completed,[k]:!store.completed[k]}}); };
  const setActual=(di,v)=>{ const k=`${week.n}-${di}`; save({...store,actual:{...store.actual,[k]:v}}); };
  const setRpe  =(di,v)=>{ const k=`${week.n}-${di}`; save({...store,rpe:{...store.rpe,[k]:v}}); };
  const setDNote=(di,v)=>{ const k=`${week.n}-${di}`; save({...store,dayNotes:{...store.dayNotes,[k]:v}}); };

  return (
    <div>
      <div style={{padding:"10px 20px",background:C.bg2,borderBottom:`1px solid ${C.b2}`,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <NavBtn label="← All" onClick={onBack}/>
        <div style={{flex:1,minWidth:150}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span style={{fontSize:10,color:p.c,fontWeight:600,textTransform:"uppercase"}}>{p.l}</span>
            <span style={{color:C.b4}}>·</span>
            <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>Week {week.n} — {week.title}</span>
            {week.isGameWeek&&<span style={{fontSize:9,background:"#d9770620",color:"#fb923c",padding:"1px 6px",borderRadius:8}}>Game week</span>}
          </div>
          <div style={{fontSize:10,color:C.t4,marginTop:1}}>
            {week.n===21?"Race week":`${week.totalMi} mi planned`}
            {week.days.some(d=>d[4])&&<span style={{marginLeft:8,color:C.gold}}>★ Milestone</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:5}}>
          <NavBtn label="←" disabled={week.n===1} onClick={onPrev}/>
          <NavBtn label="→" disabled={week.n===21} onClick={onNext}/>
        </div>
      </div>

      <div style={{padding:"12px 20px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
        {week.days.map((day,di)=>{
          const [runKey,miles,strKey,note,isMilestone,rec]=day;
          const run=RT[runKey]||RT.rest;
          const str=ST[strKey]||ST.none;
          const isDone=!!store.completed?.[`${week.n}-${di}`];
          const isRace=runKey==="race";
          const isExpanded=expandedDay===di;
          const actualMi=store.actual?.[`${week.n}-${di}`]||"";
          const rpeVal=store.rpe?.[`${week.n}-${di}`]||0;
          const noteVal=store.dayNotes?.[`${week.n}-${di}`]||"";
          const hasSess=!!SESSIONS[strKey];
          const isRest=runKey==="rest";
          const isSoc=runKey==="soc"||runKey==="game";
          const hasOverride=store.planMiOverride?.[week.n]?.[di]!==undefined;

          return (
            <div key={di} style={{background:isDone?C.gbg:(isRace?"#041a10":C.bg4),
              border:`1px solid ${isDone?C.gb:(isMilestone?C.amber:C.b2)}`,
              borderRadius:8,overflow:"hidden",outline:isRace?"1px solid #064e3b":"none"}}>
              <div style={{padding:"10px 11px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:C.t4,fontWeight:600}}>{DAYS[di]}</div>
                  <div style={{display:"flex",gap:4,alignItems:"center"}}>
                    {isMilestone&&!isDone&&<span style={{fontSize:10,color:C.gold}}>★</span>}
                    <div onClick={()=>toggle(di)} style={{width:15,height:15,borderRadius:3,
                      border:`1px solid ${isDone?C.green:C.b3}`,background:isDone?C.green:"transparent",
                      display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:8,color:"#fff"}}>
                      {isDone&&"✓"}
                    </div>
                  </div>
                </div>

                <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:run.d,flexShrink:0}}/>
                  <span style={{fontSize:11,fontWeight:600,color:run.c}}>{run.l}</span>
                  {miles>0&&<span style={{fontSize:10,color:C.t3,marginLeft:"auto"}}>{miles}mi</span>}
                  {hasOverride&&<span style={{fontSize:9,color:"#fb923c"}}>✎</span>}
                </div>

                {str.l&&(
                  <div style={{display:"flex",alignItems:"center",gap:4,cursor:hasSess?"pointer":"default",marginBottom:3}}
                    onClick={()=>{if(hasSess)openSession(strKey);}}>
                    <div style={{width:5,height:5,borderRadius:2,background:str.c,flexShrink:0}}/>
                    <span style={{fontSize:10,color:str.c}}>{str.l}</span>
                    {hasSess&&<span style={{fontSize:9,color:C.t4,marginLeft:2}}>↗</span>}
                  </div>
                )}

                {rec&&rec.length>0&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:4}}>
                    {rec.map(r=><RecPill key={r} type={r}/>)}
                  </div>
                )}

                {note&&!isExpanded&&(
                  <div style={{marginTop:6,paddingTop:5,borderTop:`1px solid ${C.b2}`,fontSize:10,color:C.t2,lineHeight:1.4}}>{note}</div>
                )}
                {isRace&&<div style={{marginTop:4,fontSize:9,color:"#34d399",fontWeight:600,textTransform:"uppercase"}}>100 miles · ~30 hrs · 91 loops</div>}
              </div>

              {!isRest&&(
                <div onClick={()=>setExpandedDay(isExpanded?null:di)}
                  style={{padding:"4px 11px",borderTop:`1px solid ${C.b2}`,background:C.bg2,
                    cursor:"pointer",fontSize:10,color:C.t3,display:"flex",alignItems:"center",gap:4}}>
                  <span>{isExpanded?"▲":"▼"}</span>
                  <span>{isExpanded?"Close":"Log / edit"}</span>
                  {(actualMi||rpeVal||noteVal)&&!isExpanded&&<span style={{marginLeft:"auto",color:C.gold,fontSize:9}}>● logged</span>}
                </div>
              )}

              {isExpanded&&!isRest&&(
                <div style={{padding:"10px 11px",background:C.bg3,borderTop:`1px solid ${C.b2}`}}>
                  {note&&<div style={{fontSize:10,color:C.t2,lineHeight:1.4,marginBottom:8,padding:"5px 8px",
                    background:C.bg2,borderRadius:4,borderLeft:`2px solid ${p.c}`}}>{note}</div>}

                  {/* Edit planned miles */}
                  {!isSoc&&miles!==null&&(
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:10,color:C.t3,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>
                        Planned miles {hasOverride&&<span style={{color:"#fb923c",fontSize:9}}>(edited)</span>}
                      </div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <input type="number" defaultValue={miles} min="0" max="100" step="0.5"
                          onBlur={e=>{
                            const v=parseFloat(e.target.value);
                            if(!isNaN(v)&&v!==miles) setPlanOverride(week.n,di,v);
                          }}
                          style={{width:"70px",background:C.bg2,border:`1px solid ${C.b3}`,borderRadius:5,
                            padding:"4px 8px",color:C.t1,fontSize:12}}/>
                        <span style={{fontSize:10,color:C.t3}}>mi</span>
                        {hasOverride&&<button onClick={()=>setPlanOverride(week.n,di,null)}
                          style={{fontSize:10,color:"#f87171",background:"none",border:"none",cursor:"pointer",padding:"0 4px"}}>
                          reset
                        </button>}
                      </div>
                    </div>
                  )}

                  {/* Log actual miles */}
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:10,color:C.t3,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>Actual miles</div>
                    <input type="number" value={actualMi} onChange={e=>setActual(di,e.target.value)}
                      placeholder={miles||"0"} min="0" max="200" step="0.1"
                      style={{width:"70px",background:C.bg2,border:`1px solid ${C.b3}`,borderRadius:5,
                        padding:"4px 8px",color:C.t1,fontSize:12}}/>
                  </div>

                  {/* RPE */}
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:10,color:C.t3,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>Feel</div>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      {[1,2,3,4,5].map(v=>(
                        <button key={v} onClick={()=>setRpe(di,v)}
                          style={{width:26,height:26,borderRadius:5,
                            border:`1px solid ${rpeVal>=v?"#fbbf24":C.b3}`,
                            background:rpeVal>=v?"#fbbf2420":C.bg2,
                            color:rpeVal>=v?"#fbbf24":C.t3,cursor:"pointer",fontSize:11,fontWeight:600}}>
                          {v}
                        </button>
                      ))}
                      <span style={{fontSize:10,color:C.t3,marginLeft:4}}>
                        {["","Easy","Solid","Hard","Very hard","Destroyed"][rpeVal]||""}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <div style={{fontSize:10,color:C.t3,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>Notes</div>
                    <textarea value={noteVal} onChange={e=>setDNote(di,e.target.value)}
                      placeholder="How did it go? Pain? What you ate, conditions, mental state..."
                      rows={3} style={{width:"100%",boxSizing:"border-box",background:C.bg2,
                        border:`1px solid ${C.b3}`,borderRadius:5,padding:"6px 8px",
                        color:C.t1,fontSize:11,resize:"vertical",lineHeight:1.5}}/>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {week.tips&&(
        <div style={{margin:"0 20px 20px",padding:"11px 14px",background:C.bg2,borderRadius:8,borderLeft:`3px solid ${p.c}`}}>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:p.c,marginBottom:4,fontWeight:600}}>Coach's note — Week {week.n}</div>
          <div style={{fontSize:12,color:"#888",lineHeight:1.65}}>{week.tips}</div>
        </div>
      )}
    </div>
  );
}

// ─── SOCCER VIEW ──────────────────────────────────────────────────────────────
function SoccerView({soc,setSoc,weeks}) {
  const [dragging,setDragging] = useState(null); // {type:'practice'|'game', dayI}

  const togglePractice = (dayI) => {
    const cur = soc.practiceDays;
    const next = cur.includes(dayI) ? cur.filter(d=>d!==dayI) : [...cur,dayI].sort();
    setSoc({...soc, practiceDays:next});
  };

  const setGameDay = (dayI) => {
    setSoc({...soc, gameDay: soc.gameDay===dayI?null:dayI});
  };

  const setGamesStart = (wk) => {
    setSoc({...soc, gamesStartWeek:parseInt(wk)});
  };

  // Drag and drop for reordering
  const handleDragStart = (type,dayI,e) => {
    setDragging({type,dayI});
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (targetDayI,e) => {
    e.preventDefault();
    if (!dragging) return;
    if (dragging.type === "practice") {
      const cur = soc.practiceDays.filter(d=>d!==dragging.dayI);
      if (!cur.includes(targetDayI)) cur.push(targetDayI);
      setSoc({...soc, practiceDays:cur.sort()});
    } else if (dragging.type === "game") {
      setSoc({...soc, gameDay:targetDayI});
    }
    setDragging(null);
  };

  const totalPractices = soc.practiceDays.length;
  const practiceLoad = totalPractices <= 2 ? "Moderate" : totalPractices === 3 ? "High" : "Very high";
  const practiceColor = totalPractices <= 2 ? "#4ade80" : totalPractices === 3 ? "#fbbf24" : "#f87171";

  return (
    <div style={{padding:"18px 20px"}}>
      <div style={{marginBottom:16,paddingBottom:14,borderBottom:`1px solid ${C.b2}`}}>
        <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.12em",color:"#fb923c",marginBottom:3,fontWeight:600}}>Schedule editor</div>
        <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>Soccer Schedule</div>
        <div style={{fontSize:12,color:"#888"}}>Drag days to rearrange, or tap to toggle. Changes update the plan automatically.</div>
      </div>

      {/* Practice days */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:600,color:C.t1}}>Practice days</div>
          <span style={{fontSize:11,color:practiceColor,fontWeight:500}}>{totalPractices} days/week · {practiceLoad} load</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6}}>
          {DAYS.map((d,i)=>{
            const isActive = soc.practiceDays.includes(i);
            const isGame = soc.gameDay === i;
            return (
              <div key={i}
                draggable={isActive}
                onDragStart={e=>handleDragStart("practice",i,e)}
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>handleDrop(i,e)}
                onClick={()=>!isGame&&togglePractice(i)}
                style={{padding:"10px 4px",borderRadius:7,textAlign:"center",cursor:"pointer",
                  background:isActive?"#ea580c20":"#0a0a0a",
                  border:`1px solid ${isActive?"#ea580c":"#1c1c1c"}`,
                  opacity:isGame?0.4:1,transition:"all 0.15s",userSelect:"none"}}>
                <div style={{fontSize:11,fontWeight:isActive?600:400,color:isActive?"#fb923c":C.t3}}>{d}</div>
                {isActive&&<div style={{fontSize:9,color:"#fb923c",marginTop:2}}>⚽</div>}
              </div>
            );
          })}
        </div>
        <div style={{fontSize:10,color:C.t4,marginTop:6}}>Tap to toggle · Drag active days to move them</div>
      </div>

      {/* Game day */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:12,fontWeight:600,color:C.t1,marginBottom:10}}>Game day</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6}}>
          {DAYS.map((d,i)=>{
            const isActive = soc.gameDay === i;
            const isPractice = soc.practiceDays.includes(i);
            return (
              <div key={i}
                draggable={isActive}
                onDragStart={e=>handleDragStart("game",i,e)}
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>handleDrop(i,e)}
                onClick={()=>setGameDay(i)}
                style={{padding:"10px 4px",borderRadius:7,textAlign:"center",cursor:"pointer",
                  background:isActive?"#d9770620":"#0a0a0a",
                  border:`1px solid ${isActive?"#fcd34d":"#1c1c1c"}`,
                  opacity:isPractice?0.5:1,transition:"all 0.15s",userSelect:"none"}}>
                <div style={{fontSize:11,fontWeight:isActive?600:400,color:isActive?"#fcd34d":C.t3}}>{d}</div>
                {isActive&&<div style={{fontSize:9,color:"#fcd34d",marginTop:2}}>🏟</div>}
              </div>
            );
          })}
        </div>
        <div style={{fontSize:10,color:C.t4,marginTop:6}}>Tap to set game day · One game day per week</div>
      </div>

      {/* Games start week */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:12,fontWeight:600,color:C.t1,marginBottom:8}}>Games start at week</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <input type="number" min="1" max="21" value={soc.gamesStartWeek}
            onChange={e=>setGamesStart(e.target.value)}
            style={{width:"60px",background:C.bg2,border:`1px solid ${C.b3}`,borderRadius:5,
              padding:"6px 10px",color:C.t1,fontSize:13,textAlign:"center"}}/>
          <span style={{fontSize:12,color:C.t2}}>Week {soc.gamesStartWeek} · currently set to first game April 19</span>
        </div>
      </div>

      {/* Impact summary */}
      <div style={{background:C.bg3,borderRadius:8,border:`1px solid ${C.b2}`,padding:"12px 14px"}}>
        <div style={{fontSize:11,fontWeight:600,color:C.t1,marginBottom:8}}>Current schedule impact</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div style={{fontSize:12,color:"#888"}}>
            <span style={{color:"#fb923c",fontWeight:500}}>Practices:</span> {soc.practiceDays.map(i=>DAYS[i]).join(", ")}
          </div>
          <div style={{fontSize:12,color:"#888"}}>
            <span style={{color:"#fcd34d",fontWeight:500}}>Game day:</span> {soc.gameDay!==null?DAYS[soc.gameDay]:"None set"}
          </div>
          <div style={{fontSize:12,color:"#888"}}>
            <span style={{color:"#a78bfa",fontWeight:500}}>Long run day:</span> {soc.gameDay!==null ? DAYS[(soc.gameDay+1)%7] + " (day after game)" : "Saturday"}
          </div>
          <div style={{fontSize:12,color:"#888"}}>
            <span style={{color:practiceColor,fontWeight:500}}>Weekly load:</span> {practiceLoad}
          </div>
        </div>
        {soc.practiceDays.length >= 3 && (
          <div style={{marginTop:10,padding:"8px 10px",background:"#fbbf2410",borderRadius:6,border:"1px solid #fbbf2420",fontSize:11,color:"#fbbf24"}}>
            ⚠ 3 practices/week is significant load. Running mileage targets are set 20–25% below the original plan to account for this.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SESSIONS VIEW ────────────────────────────────────────────────────────────
function SessionsView({sessKey,setSessKey}) {
  const [openEx,setOpenEx] = useState(null);
  const sess = SESSIONS[sessKey]||SESSIONS.strength;
  return (
    <div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",padding:"11px 20px 9px",borderBottom:`1px solid ${C.b2}`,background:C.bg2}}>
        {Object.entries(SESSIONS).map(([k,s])=>{
          const active=sessKey===k;
          return <button key={k} onClick={()=>{setSessKey(k);setOpenEx(null);}}
            style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${active?s.d:C.b2}`,
              background:active?s.d+"22":"transparent",color:active?s.c:C.t3,
              fontSize:11,cursor:"pointer",fontWeight:active?600:400}}>{s.l}</button>;
        })}
      </div>
      <div style={{padding:"16px 20px"}}>
        <div style={{marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${C.b2}`}}>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:sess.c,marginBottom:3,fontWeight:600}}>● {sess.when}</div>
          <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:4}}>{sess.l}</div>
          <div style={{fontSize:12,color:"#888",lineHeight:1.6,marginBottom:7}}>{sess.tag}</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {[["Total",sess.total],["Rest",sess.rest],["Equipment",sess.equip]].map(([l,v])=>(
              <span key={l} style={{fontSize:11,color:C.t3}}>{l}: <span style={{color:C.t2}}>{v}</span></span>
            ))}
          </div>
        </div>
        {sess.exercises.map((ex,i)=>{
          const isOpen=openEx===i;
          return (
            <div key={i} style={{background:isOpen?C.bg2:C.bg4,border:`1px solid ${isOpen?sess.d+"60":C.b2}`,
              borderRadius:8,marginBottom:7,overflow:"hidden"}}>
              <div onClick={()=>setOpenEx(isOpen?null:i)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"11px 13px",cursor:"pointer"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.t1,marginBottom:1}}>{ex.name}</div>
                  <div style={{fontSize:11,color:sess.c}}>{ex.sets}</div>
                </div>
                <span style={{fontSize:10,color:C.t4,transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▼</span>
              </div>
              {isOpen&&(
                <div style={{padding:"0 13px 13px"}}>
                  <div style={{height:1,background:C.b2,margin:"0 0 11px"}}/>
                  <Field label="Tempo" val={ex.tempo}/>
                  <Field label="How to do it" val={ex.cue}/>
                  <div style={{background:C.bg,borderLeft:`3px solid ${sess.d}`,padding:"8px 10px",marginBottom:10}}>
                    <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",color:sess.c,marginBottom:4,fontWeight:600}}>Why this exercise</div>
                    <div style={{fontSize:12,color:"#888",lineHeight:1.6}}>{ex.why}</div>
                  </div>
                  <Field label="Progression across 21 weeks" val={ex.prog} small/>
                  <a href={ex.url} target="_blank" rel="noopener noreferrer"
                    style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:7,padding:"5px 10px",
                      borderRadius:6,border:`1px solid ${sess.d}40`,color:sess.c,fontSize:11,
                      textDecoration:"none",background:sess.d+"12"}}>
                    Watch tutorial ↗
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── RECOVERY VIEW ────────────────────────────────────────────────────────────
function RecoveryView({recKey,setRecKey}) {
  const prot = REC_PROTOCOLS[recKey];
  return (
    <div>
      <div style={{display:"flex",gap:5,padding:"11px 20px 9px",borderBottom:`1px solid ${C.b2}`,background:C.bg2,flexWrap:"wrap"}}>
        {Object.entries(REC_PROTOCOLS).map(([k,p])=>{
          const active=recKey===k;
          return <button key={k} onClick={()=>setRecKey(k)}
            style={{padding:"5px 11px",borderRadius:6,border:`1px solid ${active?REC[k].c:C.b2}`,
              background:active?REC[k].bg:"transparent",color:active?REC[k].c:C.t3,
              fontSize:12,cursor:"pointer",fontWeight:active?600:400}}>{p.title}</button>;
        })}
      </div>
      <div style={{padding:"16px 20px"}}>
        <div style={{marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${C.b2}`}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:prot.c,marginBottom:3,fontWeight:600}}>Starts {prot.start}</div>
              <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:3}}>{prot.title}</div>
              <div style={{fontSize:12,color:"#888"}}>{prot.subtitle}</div>
            </div>
            <a href={prot.url} target="_blank" rel="noopener noreferrer"
              style={{padding:"6px 11px",borderRadius:6,border:`1px solid ${prot.c}40`,color:prot.c,
                fontSize:11,textDecoration:"none",background:prot.bg,whiteSpace:"nowrap"}}>
              Watch protocol ↗
            </a>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(135px,1fr))",gap:7,marginBottom:14}}>
          {prot.specs.map(({l,v})=>(
            <div key={l} style={{background:C.bg3,borderRadius:7,padding:"9px 11px"}}>
              <div style={{fontSize:10,color:C.t4,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:2}}>{l}</div>
              <div style={{fontSize:13,fontWeight:500,color:C.t1}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",color:C.t4,fontWeight:600,marginBottom:7}}>When to use it</div>
          {prot.when.map(({day,detail})=>(
            <div key={day} style={{display:"flex",gap:9,padding:"7px 0",borderBottom:`1px solid ${C.b2}`}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:prot.c,flexShrink:0,marginTop:4}}/>
              <div>
                <div style={{fontSize:12,fontWeight:500,color:C.t1,marginBottom:2}}>{day}</div>
                <div style={{fontSize:11,color:"#888",lineHeight:1.5}}>{detail}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",color:C.t4,fontWeight:600,marginBottom:7}}>Benefits</div>
          <div style={{background:prot.bg,borderRadius:8,border:`1px solid ${prot.c}30`,padding:"9px 13px"}}>
            {prot.benefits.map((b,i)=>(
              <div key={i} style={{display:"flex",gap:6,padding:"3px 0",fontSize:12,color:"#888",lineHeight:1.5}}>
                <span style={{color:prot.c,flexShrink:0}}>+</span>{b}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",color:C.t4,fontWeight:600,marginBottom:7}}>Rules & cautions</div>
          <div style={{background:"#1a0a0a",borderRadius:8,border:"1px solid #3f1a1a",padding:"9px 13px"}}>
            {prot.rules.map((r,i)=>(
              <div key={i} style={{display:"flex",gap:6,padding:"3px 0",fontSize:12,color:"#999",lineHeight:1.5}}>
                <span style={{color:"#f87171",flexShrink:0}}>!</span>{r}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NOTES VIEW ───────────────────────────────────────────────────────────────
function NotesView({store,save,weeks}) {
  const [activeWk,setActiveWk] = useState(1);
  const w = weeks[activeWk-1];
  const p = PHASES[w.phase];
  const noteVal = store.weekNotes?.[activeWk]||"";
  const setNote = (v) => save({...store,weekNotes:{...(store.weekNotes||{}),[activeWk]:v}});

  const weekStats = (n) => {
    const wk=weeks[n-1];
    const active=wk.days.filter(d=>d[0]!=="rest");
    const done=active.filter((_,i)=>!!store.completed?.[`${n}-${wk.days.indexOf(active[i])}`]).length;
    const totalMi=active.reduce((a,_,i)=>{const v=parseFloat(store.actual?.[`${n}-${i}`])||0;return a+v;},0);
    return {done,total:active.length,mi:totalMi.toFixed(1)};
  };

  return (
    <div style={{display:"flex",height:"calc(100vh - 110px)",minHeight:400}}>
      <div style={{width:68,borderRight:`1px solid ${C.b2}`,overflowY:"auto",flexShrink:0}}>
        {weeks.map(wk=>{
          const pp=PHASES[wk.phase];
          const stats=weekStats(wk.n);
          const hasNote=!!(store.weekNotes?.[wk.n]);
          return (
            <div key={wk.n} onClick={()=>setActiveWk(wk.n)}
              style={{padding:"7px 4px",borderBottom:`1px solid ${C.b2}`,cursor:"pointer",textAlign:"center",
                background:activeWk===wk.n?C.bg3:"transparent"}}>
              <div style={{fontSize:10,color:pp.c,fontWeight:600}}>W{wk.n}</div>
              <div style={{fontSize:9,color:C.t4,marginTop:1}}>{stats.done}/{stats.total}</div>
              {hasNote&&<div style={{width:4,height:4,borderRadius:"50%",background:C.gold,margin:"3px auto 0"}}/>}
            </div>
          );
        })}
      </div>
      <div style={{flex:1,padding:"14px 18px",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,flexWrap:"wrap",gap:7}}>
          <div>
            <div style={{fontSize:10,color:p.c,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:600,marginBottom:2}}>{p.l} phase</div>
            <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>Week {w.n} — {w.title}</div>
          </div>
          <div style={{display:"flex",gap:5}}>
            <NavBtn label="← Prev" disabled={activeWk===1} onClick={()=>setActiveWk(Math.max(1,activeWk-1))}/>
            <NavBtn label="Next →" disabled={activeWk===21} onClick={()=>setActiveWk(Math.min(21,activeWk+1))}/>
          </div>
        </div>
        {(()=>{
          const stats=weekStats(activeWk);
          const days=weeks[activeWk-1].days;
          const logged=days.filter((_,i)=>store.dayNotes?.[`${activeWk}-${i}`]||store.actual?.[`${activeWk}-${i}`]);
          return (
            <div style={{display:"flex",gap:7,marginBottom:12,flexWrap:"wrap"}}>
              {[["Done",`${stats.done}/${stats.total}`],["Miles",`${stats.mi}mi`],["Logged",`${logged.length} days`]].map(([l,v])=>(
                <div key={l} style={{background:C.bg3,borderRadius:7,padding:"7px 11px",flex:1,minWidth:80}}>
                  <div style={{fontSize:10,color:C.t4,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:14,fontWeight:600,color:C.t1}}>{v}</div>
                </div>
              ))}
            </div>
          );
        })()}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:C.t4,fontWeight:600,marginBottom:7}}>Day logs</div>
          {weeks[activeWk-1].days.map((day,di)=>{
            const [runKey]=day;
            if(runKey==="rest") return null;
            const key=`${activeWk}-${di}`;
            const isDone=!!store.completed?.[key];
            const actualMi=store.actual?.[key];
            const rpe=store.rpe?.[key];
            const dayNote=store.dayNotes?.[key];
            const run=RT[runKey]||RT.rest;
            return (
              <div key={di} style={{padding:"7px 9px",background:C.bg3,borderRadius:7,marginBottom:5,border:`1px solid ${isDone?C.gb:C.b2}`}}>
                <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,fontWeight:600,color:C.t3}}>{DAYS[di]}</span>
                  <span style={{width:4,height:4,borderRadius:"50%",background:run.d,display:"inline-block"}}/>
                  <span style={{fontSize:11,color:run.c}}>{run.l}</span>
                  {actualMi&&<span style={{fontSize:10,color:C.t2,marginLeft:"auto"}}>{actualMi}mi</span>}
                  {rpe>0&&<span style={{fontSize:10,background:"#fbbf2420",color:"#fbbf24",padding:"1px 5px",borderRadius:7}}>RPE {rpe}</span>}
                  {isDone&&<span style={{fontSize:9,background:C.gb,color:"#4ade80",padding:"1px 5px",borderRadius:7}}>✓</span>}
                </div>
                {dayNote&&<div style={{fontSize:11,color:"#888",lineHeight:1.5,marginTop:3,paddingTop:3,borderTop:`1px solid ${C.b2}`}}>{dayNote}</div>}
                {!dayNote&&!actualMi&&<div style={{fontSize:10,color:C.t4,fontStyle:"italic",marginTop:2}}>No log yet</div>}
              </div>
            );
          })}
        </div>
        <div>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:C.t4,fontWeight:600,marginBottom:7}}>Weekly journal</div>
          <textarea value={noteVal} onChange={e=>setNote(e.target.value)}
            placeholder={`Week ${activeWk} reflection...\n\nHow did training go? Patterns in fatigue or soreness? What's working? How's the knee holding up?`}
            rows={8} style={{width:"100%",boxSizing:"border-box",background:C.bg3,border:`1px solid ${C.b3}`,
              borderRadius:7,padding:"9px 11px",color:C.t1,fontSize:12,resize:"vertical",lineHeight:1.65}}/>
        </div>
      </div>
    </div>
  );
}
