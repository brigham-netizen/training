import { useState, useEffect, useRef, useCallback } from "react";

// ─── PALETTE & CONSTANTS ──────────────────────────────────────────────────────
const C = {
  bg:"#080808",bg1:"#0f0f0f",bg2:"#141414",bg3:"#1a1a1a",bg4:"#111",
  b1:"#222",b2:"#1c1c1c",b3:"#2a2a2a",b4:"#333",
  t1:"#e8e8e8",t2:"#888",t3:"#555",t4:"#333",
  green:"#166534",gbg:"#0a160a",gb:"#1a4520",
  gold:"#fbbf24",amber:"#78350f",
  red:"#dc2626",redbg:"#1a0a0a",
};

const PHASES = {
  base: {l:"Base",  c:"#a78bfa",d:"#7c3aed",w:"1–5"},
  build:{l:"Build", c:"#34d399",d:"#059669",w:"6–11"},
  peak: {l:"Peak",  c:"#fbbf24",d:"#d97706",w:"12–18"},
  taper:{l:"Taper", c:"#94a3b8",d:"#64748b",w:"19–21"},
};

const RT = {
  easy: {l:"Easy run",        c:"#60a5fa",d:"#3b82f6"},
  long: {l:"Long run",        c:"#c084fc",d:"#9333ea"},
  tempo:{l:"Tempo run",       c:"#fb923c",d:"#ea580c"},
  loop: {l:"Loop sim",        c:"#fcd34d",d:"#f59e0b"},
  nloop:{l:"Night loop sim",  c:"#818cf8",d:"#6366f1"},
  btb:  {l:"Back-to-back",    c:"#f87171",d:"#dc2626"},
  big50:{l:"50-Mile effort",  c:"#fde68a",d:"#eab308"},
  race: {l:"RACE DAY",        c:"#6ee7b7",d:"#10b981"},
  shake:{l:"Shakeout",        c:"#67e8f9",d:"#06b6d4"},
  game: {l:"Game day",        c:"#fcd34d",d:"#d97706"},
  soc:  {l:"Soccer practice", c:"#fb923c",d:"#ea580c"},
  rest: {l:"Rest",            c:"#444",   d:"#333"},
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
  sauna:    {l:"Sauna",            c:"#fb923c",bg:"#ea580c18"},
  ice:      {l:"Ice bath",         c:"#60a5fa",bg:"#3b82f618"},
  contrast: {l:"Contrast therapy", c:"#a78bfa",bg:"#7c3aed18"},
};

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ─── WEEK DATA ────────────────────────────────────────────────────────────────
const WEEKS = [
  {n:1, phase:"base", mi:13, gw:false, title:"First steps (still sick — take it easy)",
    tips:"You're sick. Soccer counts as your main cardio this week. Do the strength circuit on Tuesday and Friday only if the cough is gone. No guilt about the low mileage — building on illness just costs you later.",
    days:[
      ["soc",0,"mob","Soccer practice 6:30–8pm",false,[]],
      ["easy",3,"strength","Easy 3mi — walk if coughing",false,[]],
      ["soc",0,"light","Soccer practice 6:30–8pm",false,[]],
      ["rest",0,"none","Rest — cough needs to clear",false,[]],
      ["easy",3,"strength","Easy 3mi only if feeling better",false,[]],
      ["easy",4,"post","Easy long — no heroics week 1",false,[]],
      ["rest",0,"full","Full mobility — 15 min",false,[]],
    ]},
  {n:2, phase:"base", mi:16, gw:false, title:"Build the base, start recovery protocols",
    tips:"First week of sauna and ice bath. Start conservative — 15 min sauna Tuesday after your run, 10 min ice bath after Saturday's long run. Your body will thank you by Sunday.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",4,"strength","Primary run day",false,["sauna"]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["easy",3,"stability","Easy effort",false,[]],
      ["easy",3,"strength","Easy effort",false,[]],
      ["long",6,"post","First proper long run",false,["ice"]],
      ["rest",0,"full","Full mobility + sauna if available",false,["sauna"]],
    ]},
  {n:3, phase:"base", mi:19, gw:false, title:"First double-digit long run",
    tips:"First 10-miler is a real milestone. Don't go fast — the point is time on feet, not pace. Ice bath immediately after, then the full post-run stretch.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",4,"strength","Primary run day",false,["sauna"]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["easy",3,"stability",null,false,[]],
      ["easy",4,"strength",null,false,[]],
      ["long",10,"post","First 10-miler — celebrate it",true,["ice"]],
      ["rest",0,"full","Full mobility",false,["sauna"]],
    ]},
  {n:4, phase:"base", mi:13, gw:false, title:"Recovery week — back off completely",
    tips:"Recovery weeks are where fitness is actually built. The adaptation happens when you rest. Resist every urge to add miles. Stick to the exact targets.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",3,"light","Easy recovery run",false,[]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["rest",0,"none","Full rest",false,[]],
      ["easy",4,"light","Easy effort only",false,[]],
      ["easy",6,"post","Easy long — no pushing",false,["ice"]],
      ["rest",0,"full","Full mobility",false,["sauna"]],
    ]},
  {n:5, phase:"base", mi:20, gw:true, title:"First game week — long run shifts to Sunday",
    tips:"Big structural shift this week. Saturday is your first game — treat it like a race effort but don't blow yourself up. Sunday long run on game-tired legs is intentional training. Welcome to your weekly back-to-back.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",5,"strength","Primary run day",false,["sauna"]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["easy",4,"stability","Easy — big weekend ahead",false,[]],
      ["rest",0,"mob","REST — protect Saturday",false,[]],
      ["game",0,"mob","First game — leave it on the field",true,["ice"]],
      ["long",11,"post","Long run on tired legs. This is the workout.",true,["contrast"]],
    ]},
  {n:6, phase:"build", mi:24, gw:true, title:"Build phase begins, tempo work starts",
    tips:"Tempo runs start this week. Comfortably hard — you should be able to say a short sentence but not have a conversation. 7:20/mi pace is your target.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",5,"strength",null,false,["sauna"]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["tempo",4,"stability","Comfortably hard — 7:20/mi",false,[]],
      ["rest",0,"mob","REST",false,[]],
      ["game",0,"mob","Game day",false,["ice"]],
      ["long",14,"post","14 miles — your new longest run",true,["contrast"]],
    ]},
  {n:7, phase:"build", mi:26, gw:true, title:"Building endurance",
    tips:"Sunday long runs are your most important sessions of the entire plan. Protect them above everything. Game on Saturday + long run Sunday is genuine race-specific training.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",6,"strength",null,false,["sauna"]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["easy",5,"stability",null,false,[]],
      ["rest",0,"mob","REST",false,[]],
      ["game",0,"mob","Game day",false,["ice"]],
      ["long",16,"post","16 miles",false,["contrast"]],
    ]},
  {n:8, phase:"build", mi:20, gw:true, title:"Recovery week",
    tips:"Second recovery week. Don't skip the contrast therapy on Sunday — the alternating hot/cold on a recovery week is powerful for resetting your connective tissue.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",5,"light",null,false,[]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["rest",0,"none","Full rest",false,[]],
      ["rest",0,"mob","REST",false,[]],
      ["game",0,"mob","Game day",false,["ice"]],
      ["long",10,"post","Easy long — no pushing",false,["contrast"]],
    ]},
  {n:9, phase:"build", mi:30, gw:true, title:"First loop simulation",
    tips:"Loop simulation is the most race-specific training you'll do. After the Sunday long run, do 6-8 loops of 1.1 miles with 10 min seated rest between each. Practice sitting down, eating something, then getting back up and going again. That discipline will save you at mile 60.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",6,"strength",null,false,["sauna"]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["easy",5,"stability",null,false,[]],
      ["rest",0,"mob","REST",false,[]],
      ["game",0,"mob","Game day",false,["ice"]],
      ["loop",null,"post","Long run + loop sim: 6-8x(1.1mi + 10min rest)",true,["contrast"]],
    ]},
  {n:10, phase:"build", mi:33, gw:true, title:"First night run",
    tips:"Night run this week. Set an alarm for 10pm on Thursday and go. Your body at 2am on race day needs to know this is possible. Sunday's long run will be hard after a full week — lean into it.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",7,"strength",null,false,["sauna"]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["easy",6,"stability","RUN AT 10PM — simulate race night conditions",true,[]],
      ["rest",0,"mob","REST",false,[]],
      ["game",0,"mob","Game day",false,["ice"]],
      ["long",18,"post","18 miles — new distance PR",true,["contrast"]],
    ]},
  {n:11, phase:"build", mi:24, gw:true, title:"Recovery + easy loop sim",
    tips:"Recovery week but keep the loop format in muscle memory. 6 easy loops on Sunday at conversation pace — practice the sit-down reset, drink something, go again.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",6,"light",null,false,[]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["rest",0,"none","Full rest",false,[]],
      ["rest",0,"mob","REST",false,[]],
      ["game",0,"mob","Game day",false,["ice"]],
      ["loop",null,"post","6x easy loops — practice the format, not the fitness",false,["contrast"]],
    ]},
  {n:12, phase:"peak", mi:36, gw:true, title:"Peak phase — the real work starts",
    tips:"You've entered the peak phase. Everything from here to week 18 is the hardest and most important training you'll do. Protect sleep above all else — 8+ hours every night.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",8,"strength",null,false,["sauna"]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["easy",6,"stability",null,false,[]],
      ["rest",0,"mob","REST",false,[]],
      ["game",0,"mob","Game day — wear race shoes",true,["ice"]],
      ["long",20,"post","First 20-miler. Major milestone.",true,["contrast"]],
    ]},
  {n:13, phase:"peak", mi:38, gw:true, title:"Night loop simulation",
    tips:"Saturday night into Sunday morning — do 6 loops starting at 11pm before your Sunday long run. This is the closest you'll get to race conditions. The darkness, the fatigue, the mental game.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",8,"strength",null,false,["sauna"]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["easy",6,"stability",null,false,[]],
      ["rest",0,"mob","REST",false,[]],
      ["nloop",null,"mob","6x loops starting at 11pm — then sleep",true,["ice"]],
      ["long",22,"post","Long run after a night of loops. Brutal. Perfect.",true,["contrast"]],
    ]},
  {n:14, phase:"peak", mi:28, gw:true, title:"Recovery week",
    tips:"Third recovery week in peak. Your body is carrying more load than it ever has. These recovery weeks aren't optional — they're when the adaptations from weeks 12 and 13 get locked in.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",6,"light",null,false,[]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["rest",0,"none","Full rest",false,[]],
      ["rest",0,"mob","REST",false,[]],
      ["game",0,"mob","Game day",false,["ice"]],
      ["loop",null,"post","6x easy loops + 12mi easy run",false,["contrast"]],
    ]},
  {n:15, phase:"peak", mi:42, gw:true, title:"THE 50-MILE EFFORT",
    tips:"This is your defining training moment. The 50-mile effort happens on Sunday. Start early — 5am or 6am. You will hit a wall somewhere between hours 6 and 8. That wall is the workout. You survived Whitney on pure will. Call on the same thing here.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",4,"strength",null,false,[]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["easy",4,"stability",null,false,[]],
      ["rest",0,"mob","REST — eat big, sleep early, gear ready",false,[]],
      ["game",0,"mob","Game — conserve energy. Big day tomorrow.",false,["ice"]],
      ["big50",50,"post","50-MILE EFFORT. ~10 hours. This changes you.",true,["contrast"]],
    ]},
  {n:16, phase:"peak", mi:44, gw:true, title:"Full race simulation",
    tips:"Race simulation weekend. Wear your actual race gear. Eat your actual race food. Run at your actual race pace. Find out what doesn't work NOW, not on August 15th.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",8,"strength",null,false,["sauna"]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["easy",6,"stability",null,false,[]],
      ["rest",0,"mob","REST",false,[]],
      ["game",0,"mob","Game — race gear, race nutrition",true,["ice"]],
      ["loop",null,"post","16x loops after game. Race pace. Race mindset.",true,["contrast"]],
    ]},
  {n:17, phase:"peak", mi:32, gw:true, title:"Recovery + nutrition focus",
    tips:"Recovery week before your peak. Focus obsessively on nutrition and sleep. 8+ hours every night. Practice your exact race-day food on Sunday's long run.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",7,"light",null,false,[]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["easy",5,"stability",null,false,[]],
      ["rest",0,"mob","REST — eat well, sleep 9hrs",false,[]],
      ["game",0,"mob","Game day",false,["ice"]],
      ["long",18,"post","18 miles with race nutrition",false,["contrast"]],
    ]},
  {n:18, phase:"peak", mi:47, gw:true, title:"Peak week — the summit of training",
    tips:"This is it. Your hardest week. Everything you do this week goes directly into the bank for August 15th. Saturday game + Sunday overnight loop sim is the hardest back-to-back of the entire plan.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",8,"strength",null,false,["sauna"]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["easy",7,"stability",null,false,[]],
      ["rest",0,"mob","REST — you need everything for the weekend",false,[]],
      ["game",0,"mob","Game — race gear on",true,["ice"]],
      ["nloop",null,"post","20x overnight loops. Start at 9pm. Run into the night.",true,["contrast"]],
    ]},
  {n:19, phase:"taper", mi:38, gw:true, title:"Taper begins — protect what you built",
    tips:"Taper madness is real. Your legs will feel heavy. Your fitness will feel like it's disappearing. It isn't. Trust the work.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",8,"strength",null,false,["sauna"]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["easy",6,"stability",null,false,[]],
      ["rest",0,"mob","REST",false,[]],
      ["game",0,"mob","Game day — taper effort",false,["ice"]],
      ["long",16,"post","Keep intensity, reduce volume",false,["contrast"]],
    ]},
  {n:20, phase:"taper", mi:26, gw:true, title:"Final sharpening week",
    tips:"Almost there. No heroics. No junk miles. Sleep 9+ hours every night. Eat more than you think you need.",
    days:[
      ["soc",0,"mob","Soccer practice",false,[]],
      ["easy",6,"light",null,false,[]],
      ["soc",0,"light","Soccer practice",false,[]],
      ["easy",4,"stability",null,false,[]],
      ["rest",0,"mob","REST",false,[]],
      ["game",0,"mob","Game — light effort, healthy above all",false,["ice"]],
      ["long",12,"post","12 miles easy",false,["contrast"]],
    ]},
  {n:21, phase:"taper", mi:9, gw:false, title:"Race week — trust everything",
    tips:"This is it. Five months of training. You came to Whitney unprepared and survived on will alone. This time you show up with both. The work is done. All you have to do now is execute.\n\nNote: The Aug 8 game should already be skipped. You're in lockdown mode.",
    days:[
      ["shake",3,"mob","Easy shakeout — stay loose",false,[]],
      ["shake",3,"mob","Easy shakeout",false,[]],
      ["shake",3,"light","Last run before the race",false,[]],
      ["rest",0,"none","TOTAL REST — legs elevated",false,[]],
      ["rest",0,"none","TOTAL REST — travel, gear check",false,[]],
      ["race",100,"none","AUG 15 — 100 MILES",true,[]],
      ["rest",0,"none","You just did something most people will never do.",false,[]],
    ]},
];

// ─── SESSION LIBRARY ──────────────────────────────────────────────────────────
const SESSIONS = {
  strength:{
    l:"Strength Circuit", when:"Mon & Fri · ~25 min",
    c:"#a78bfa", d:"#7c3aed",
    tag:"Builds the muscles that protect your knees and absorb 30 hours of impact",
    rest:"60–90 sec between sets", total:"~25 min", equip:"Step/box · optional dumbbells",
    exercises:[
      {name:"Single-leg Romanian deadlift", sets:"3×10 each leg", tempo:"2 sec down, 1 sec hold, 1 sec up",
       cue:"Hinge at the hip, back flat, free leg straight behind you. Feel the hamstring stretch. Don't let hips rotate open.",
       why:"Hamstrings and glutes are your primary shock absorbers behind the knee. When they fatigue at mile 50, the joint takes the full load.",
       prog:"Wks 1–5: bodyweight. Wks 6–11: dumbbell in opposite hand. Wks 12+: heavier load or 3-sec lowering.",
       url:"https://www.youtube.com/results?search_query=single+leg+romanian+deadlift+form"},
      {name:"Eccentric step-down", sets:"3×12 each leg", tempo:"3-second lowering — this is the whole point",
       cue:"Stand on a step, one foot. Slowly lower your other heel to the floor over 3 full seconds. Touch lightly, stand back up. Knee tracks over second toe — no caving inward.",
       why:"Eccentric quad loading is the single best evidence-based exercise for runner's knee. If you do one thing, make it this.",
       prog:"Wks 1–5: bodyweight 3-sec lowering. Wks 6+: add light weight. Wks 12+: 4-sec lowering.",
       url:"https://www.youtube.com/results?search_query=eccentric+step+down+runners+knee+exercise"},
      {name:"Bulgarian split squat", sets:"3×8 each leg", tempo:"Controlled down, drive up through the heel",
       cue:"Rear foot elevated on bench or couch. Front foot forward so shin stays vertical at bottom. Lower until rear knee nearly touches floor.",
       why:"Single-leg quad and glute strength under real load — closest gym exercise to running on hour-20 legs.",
       prog:"Wks 1–5: bodyweight. Wks 6+: dumbbells. Wks 12+: heavier or 2-sec pause at bottom.",
       url:"https://www.youtube.com/results?search_query=bulgarian+split+squat+tutorial+form"},
      {name:"Single-leg calf raise (off a step)", sets:"3×15 each leg", tempo:"2 sec up, 1 sec hold, 2 sec down",
       cue:"Stand on edge of step on one foot, heel hanging. Lower all the way, rise all the way.",
       why:"Your calves absorb 3× body weight per stride. Weak calves shift that directly up to the knee.",
       prog:"Wks 1–5: bodyweight. Wks 8+: hold dumbbell on same side as working leg.",
       url:"https://www.youtube.com/results?search_query=single+leg+calf+raise+eccentric+step"},
    ]},
  stability:{
    l:"Stability Circuit", when:"Wed · ~20 min",
    c:"#2dd4bf", d:"#0d9488",
    tag:"Trains your knee to track straight when fatigued at 3am during the race",
    rest:"45–60 sec between sets", total:"~20 min", equip:"Mini resistance band · step/box",
    exercises:[
      {name:"Lateral band walks", sets:"3×20 steps each direction", tempo:"Slow — don't let the band snap you",
       cue:"Mini band around ankles. Slight squat position. Step sideways, keep constant band tension.",
       why:"Activates gluteus medius — prevents knee valgus (inward collapse). #1 mechanical cause of knee breakdown in ultras.",
       prog:"Wks 1–5: light band. Wks 8+: medium band. Wks 14+: heavier or add squat pulse.",
       url:"https://www.youtube.com/results?search_query=lateral+band+walks+glute+activation+runner"},
      {name:"Single-leg balance, eyes closed", sets:"3×30 sec each leg", tempo:"Hold still — wobbling is the workout",
       cue:"One foot, soft knee bend, eyes closed. Grip the floor with your toes.",
       why:"Trains proprioception. After 20 hours of running, proprioceptive function degrades badly.",
       prog:"Wks 1–5: flat ground. Wks 8+: folded towel. Wks 14+: single-leg squat pulses while balancing.",
       url:"https://www.youtube.com/results?search_query=single+leg+balance+proprioception+training"},
      {name:"Lateral step-down (off a box)", sets:"3×10 each leg", tempo:"4-second lowering — painfully slow",
       cue:"Stand sideways on 6–8 inch box. Lower outside foot over 4 full seconds. Knee tracks over second toe.",
       why:"If your knee wobbles here, it will collapse at mile 70 when stabilizers are exhausted.",
       prog:"Wks 1–5: 6-inch step. Wks 8+: higher box. Wks 12+: light dumbbell.",
       url:"https://www.youtube.com/results?search_query=lateral+step+down+knee+stability+test"},
      {name:"Glute bridge with 2-sec hold", sets:"3×15", tempo:"Drive up, hold 2 sec, lower controlled",
       cue:"Feet flat, knees at 90°. Drive through heels. Squeeze glutes hard at top.",
       why:"Reinforces glute activation keeping pelvis stable. A dropping pelvis leads directly to IT band syndrome.",
       prog:"Wks 1–5: double-leg. Wks 6+: single-leg. Wks 12+: single-leg with band above knees.",
       url:"https://www.youtube.com/results?search_query=glute+bridge+runner+form+tutorial"},
    ]},
  mob:{
    l:"Mobility Warmup", when:"Before every run · ~8 min",
    c:"#86efac", d:"#16a34a",
    tag:"Prepares joints and tissue — two minutes here prevents hours of pain later",
    rest:"No rest — flow through it", total:"~8 min", equip:"None",
    exercises:[
      {name:"World's greatest stretch", sets:"5 reps each side", tempo:"Slow and flowing — 2–3 sec each position",
       cue:"Deep lunge. Same-side hand inside front foot. Rotate top arm toward ceiling. Flow between positions.",
       why:"Opens hip flexors, thoracic spine, groin and ankle in one movement.",
       prog:"Same throughout. Deepen the lunge as mobility improves.",
       url:"https://www.youtube.com/results?search_query=worlds+greatest+stretch+tutorial"},
      {name:"Hip circles — leg swings", sets:"10 forward/back + 10 side-to-side each leg", tempo:"Controlled swing",
       cue:"Hold a wall. Swing one leg through full range, relaxed. Don't force it.",
       why:"Lubricates the hip joint and activates hip flexors. Tight hips = misaligned knee tracking.",
       prog:"Same throughout.",
       url:"https://www.youtube.com/results?search_query=leg+swings+hip+mobility+warmup+runner"},
      {name:"Ankle circles + dorsiflexion drill", sets:"10 circles each direction + 10 knee-over-toe rocks", tempo:"Slow circles, controlled rocks",
       cue:"Circles: rotate each ankle. Rocks: push knee forward over toes without heel rising.",
       why:"Restricted ankle mobility forces knee to collapse inward on every stride.",
       prog:"Same throughout. Goal: knee further past toes each week.",
       url:"https://www.youtube.com/results?search_query=ankle+dorsiflexion+mobility+drill+runner"},
    ]},
  post:{
    l:"Post-run Stretch", when:"After every long run · ~10 min",
    c:"#5eead4", d:"#0891b2",
    tag:"Do this while tissue is still warm — it makes a real difference",
    rest:"No rest — flow through it", total:"~10 min", equip:"None",
    exercises:[
      {name:"Figure-4 glute stretch (lying)", sets:"2 min each side", tempo:"Static hold — breathe into it",
       cue:"Lie on back. Cross one ankle over opposite knee. Pull both legs toward chest.",
       why:"Tight glutes drag the IT band across the knee. IT band syndrome is a top ultra DNF cause.",
       prog:"Deepen the pull as flexibility improves.",
       url:"https://www.youtube.com/results?search_query=figure+four+glute+stretch+lying"},
      {name:"Hip flexor couch stretch", sets:"2 min each side", tempo:"Static hold — deepen after 30 sec",
       cue:"Kneel with one shin against a couch. TUCK YOUR PELVIS — most people miss this.",
       why:"Most important and most skipped stretch for runners. Tight hip flexors tilt the pelvis.",
       prog:"Wks 1–8: floor near couch. Wks 9+: shin elevated higher.",
       url:"https://www.youtube.com/results?search_query=couch+stretch+hip+flexor+tutorial"},
      {name:"Standing quad stretch", sets:"60 sec each side", tempo:"Static hold",
       cue:"Stand on one leg, pull other heel to glute. Keep knees together. Tuck pelvis slightly.",
       why:"Relieves quad compression. Directly reduces post-run knee soreness.",
       prog:"Same throughout.",
       url:"https://www.youtube.com/results?search_query=standing+quad+stretch+proper+form+runner"},
    ]},
  full:{
    l:"Full Mobility Routine", when:"Sunday · ~15 min",
    c:"#bbf7d0", d:"#15803d",
    tag:"Your weekly tissue reset — do this consistently and joints will thank you by week 12",
    rest:"No rest — flow work", total:"~15 min", equip:"None",
    exercises:[
      {name:"Figure-4 glute stretch", sets:"2.5 min each side", tempo:"Hold and breathe — go deeper as tissue releases",
       cue:"Same as post-run but longer. Let the first minute just arrive. The second minute is where real change happens.",
       why:"Longer hold = more lasting tissue change. IT band and glute health for the week ahead.",
       prog:"Deepen over the weeks.",
       url:"https://www.youtube.com/results?search_query=figure+four+glute+stretch+deep+hold"},
      {name:"Hip flexor couch stretch", sets:"2.5 min each side", tempo:"Progressive deepening — sink further every 30 sec",
       cue:"At 90 seconds, sink 5% deeper by tucking pelvis further. Breathe, let gravity work.",
       why:"The full Sunday hold shifts your hip flexor length over 21 weeks.",
       prog:"Shin higher on the couch over the weeks.",
       url:"https://www.youtube.com/results?search_query=couch+stretch+long+hold+hip+flexor"},
      {name:"Child's pose with side reach", sets:"90 sec center + 60 sec each side", tempo:"Slow breathing",
       cue:"Kneel, sit back toward heels, arms forward. Walk arms to one side and hold.",
       why:"Decompresses the lumbar spine after a week of running.",
       prog:"Same throughout.",
       url:"https://www.youtube.com/results?search_query=childs+pose+side+reach+thoracic+mobility"},
      {name:"Seated soleus stretch", sets:"90 sec each ankle", tempo:"Static hold, knee bent",
       cue:"Sit on floor, one leg bent. Pull toes toward shin. Keep knee bent — targets the deep calf.",
       why:"#1 overlooked contributor to Achilles and knee issues in high-mileage training.",
       prog:"Goal: toes closer to shin each week.",
       url:"https://www.youtube.com/results?search_query=seated+soleus+stretch+deep+calf+runner"},
      {name:"Thread the needle — thoracic rotation", sets:"10 reps each side", tempo:"Slow — reach as far as possible",
       cue:"On hands and knees. One arm sweeps under your body, rotating thoracic spine. Follow with eyes. Rise and reach.",
       why:"Upper back stiffness causes altered running mechanics.",
       prog:"Increase rotational range over the weeks.",
       url:"https://www.youtube.com/results?search_query=thread+the+needle+thoracic+rotation+stretch"},
    ]},
  light:{
    l:"Light Stretch", when:"Recovery days · ~5 min",
    c:"#a7f3d0", d:"#059669",
    tag:"Recovery weeks are where fitness is built — don't add intensity here",
    rest:"None", total:"~5 min", equip:"None",
    exercises:[
      {name:"Standing hip flexor stretch", sets:"60 sec each side", tempo:"Gentle static hold only",
       cue:"Light lunge, rear knee down. Soft pelvic tuck. Gentle hold only — intentionally less intense.",
       why:"Keeps tissue from stiffening without adding training stress.",
       prog:"Same throughout.",
       url:"https://www.youtube.com/results?search_query=standing+hip+flexor+lunge+stretch+gentle"},
      {name:"Supine figure-4", sets:"90 sec each side", tempo:"Completely passive",
       cue:"Lie on back. Cross ankle over opposite knee. Don't pull toward chest — let it hang, gravity works.",
       why:"Maintains glute and IT band length during recovery.",
       prog:"Same throughout.",
       url:"https://www.youtube.com/results?search_query=supine+figure+four+passive+stretch"},
      {name:"Ankle circles", sets:"20 each direction each ankle", tempo:"Slow, full range",
       cue:"Seated. Trace the biggest circle you can with your toes.",
       why:"Prevents ankle stiffness during recovery weeks.",
       prog:"Same throughout.",
       url:"https://www.youtube.com/results?search_query=ankle+circles+mobility+exercise"},
    ]},
};

// ─── RECOVERY PROTOCOLS ───────────────────────────────────────────────────────
const REC_PROTOCOLS = {
  sauna:{
    title:"Sauna Protocol", subtitle:"Heat adaptation + cardiovascular recovery",
    c:"#fb923c", bg:"#ea580c12", start:"Week 2",
    url:"https://www.youtube.com/results?search_query=andrew+huberman+sauna+protocol+athletes",
    specs:[
      {l:"Temperature",v:"170–190°F (77–88°C)"},
      {l:"Duration",v:"15–20 min per session"},
      {l:"Frequency",v:"3–4x per week"},
      {l:"Best timing",v:"Within 1 hour post-workout"},
    ],
    when:[
      {day:"Tuesday",detail:"15 min after easy run + strength. Shower, sit, let the heat work."},
      {day:"Sunday",detail:"20 min on full rest day. Excellent for weekly tissue reset."},
      {day:"Pre-game Monday",detail:"15 min if legs are heavy from Sunday's long run. Before practice, not after."},
    ],
    benefits:[
      "Increases plasma volume — more blood to working muscles",
      "Growth hormone spike during and after the session",
      "Improves cardiovascular efficiency at the same pace",
      "Accelerates connective tissue recovery",
      "Mental hardening — sitting in heat trains discomfort tolerance",
    ],
    rules:[
      "NOT when sick — heat stresses an already-taxed immune system",
      "NOT within 4 hours of an ice bath on the same day (unless doing contrast therapy)",
      "Hydrate: 16–20oz water before, drink during if possible",
      "Exit if dizzy, heart racing, or feeling unwell — not a toughness test",
    ],
  },
  ice:{
    title:"Ice Bath Protocol", subtitle:"Inflammation reduction + connective tissue recovery",
    c:"#60a5fa", bg:"#3b82f612", start:"Week 2",
    url:"https://www.youtube.com/results?search_query=ice+bath+cold+water+immersion+protocol+recovery",
    specs:[
      {l:"Temperature",v:"50–59°F (10–15°C)"},
      {l:"Duration",v:"10–12 minutes"},
      {l:"Frequency",v:"1–2x per week"},
      {l:"Best timing",v:"Within 30 min of finishing"},
    ],
    when:[
      {day:"Saturday (game day)",detail:"10–12 min immediately post-game. Reduces acute inflammation from 90 min of sprinting."},
      {day:"After long runs (practice weeks)",detail:"10–12 min after Saturday long runs in weeks 1–4."},
    ],
    benefits:[
      "Dramatically reduces delayed onset muscle soreness (DOMS)",
      "Speeds connective tissue and tendon recovery",
      "Reduces systemic inflammation from hard efforts",
      "Mental toughness training — the discomfort is part of the protocol",
    ],
    rules:[
      "Do NOT use within 4 hours of strength training if building muscle is a goal",
      "Fill a bathtub with cold tap water + 2–3 bags of ice",
      "Ease in slowly — feet first, then legs, then waist",
      "Stay seated, breathe slowly and deliberately",
      "Set a timer — don't guess",
    ],
  },
  contrast:{
    title:"Contrast Therapy Protocol", subtitle:"The most powerful recovery tool in the plan — save it for Sundays",
    c:"#a78bfa", bg:"#7c3aed12", start:"Week 5 (game weeks)",
    url:"https://www.youtube.com/results?search_query=contrast+therapy+cold+plunge+sauna+protocol+athletes",
    specs:[
      {l:"Full protocol",v:"10 min sauna → 3 min cold → 10 min sauna → 3 min cold"},
      {l:"Shower version",v:"3 min hot → 30 sec cold, repeat 4 cycles"},
      {l:"Frequency",v:"Once per week (Sunday post-long run)"},
      {l:"Total time",v:"~26 min"},
    ],
    when:[
      {day:"Sunday post-long run",detail:"Your hardest single session of the week. Contrast therapy here accelerates recovery for the full week ahead. Every game week from week 5 onward."},
    ],
    benefits:[
      "Alternating vasodilation/vasoconstriction flushes metabolic waste from muscle tissue",
      "Dramatically reduces next-day fatigue — Monday practice will feel better",
      "Best single recovery tool for high-frequency training",
      "The transition from heat to cold trains the nervous system's stress response",
    ],
    rules:[
      "Always end on cold — the cold finishing phase produces the hormonal recovery spike",
      "If no sauna: do the shower version — hot as you can bear, then cold, repeat",
      "Don't do this when sick or if core temperature is already elevated",
      "Eat and hydrate before — don't do it depleted",
    ],
  },
};

// ─── STORAGE — uses localStorage instead of window.storage ───────────────────
const STORE_KEY = "brigham_plan_v4";

const useStore = () => {
  const [data, setData] = useState({ completed:{}, actual:{}, rpe:{}, dayNotes:{}, weekNotes:{} });
  const timer = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch (e) {
      console.warn("Could not load saved data:", e);
    }
  }, []);

  // Save to localStorage with debounce
  const save = useCallback((next) => {
    setData(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn("Could not save data:", e);
      }
    }, 400);
  }, []);

  return [data, save];
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const RecPill = ({ type }) => {
  const t = REC[type];
  if (!t) return null;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"1px 7px",
      borderRadius:10, fontSize:10, fontWeight:500, background:t.bg, color:t.c }}>
      <span style={{fontSize:9}}>●</span> {t.l}
    </span>
  );
};

const NavBtn = ({ label, disabled, onClick }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ background:"none", border:`1px solid ${C.b3}`, borderRadius:6,
      color: disabled ? C.t4 : C.t2, padding:"5px 10px", cursor: disabled?"default":"pointer",
      opacity: disabled ? 0.3 : 1, fontSize:12 }}>
    {label}
  </button>
);

const Field = ({label, val, small}) => (
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

  const totalWorkouts = WEEKS.reduce((a,w) => a + w.days.filter(d=>d[0]!=="rest").length, 0);
  const doneCount = Object.values(store.completed).filter(Boolean).length;
  const pct = Math.round((doneCount / totalWorkouts) * 100);
  const daysLeft = Math.max(0, Math.ceil((new Date("2026-08-15") - new Date()) / 86400000));

  const openSession = (key) => { setSessKey(key); setTab("sessions"); };

  return (
    <div style={{background:C.bg, minHeight:"100vh", color:C.t1, fontFamily:"system-ui,-apple-system,sans-serif"}}>
      {/* Header */}
      <div style={{background:C.bg1, borderBottom:`1px solid ${C.b2}`, padding:"16px 20px 12px"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"8px"}}>
          <div>
            <div style={{fontSize:10, letterSpacing:"0.14em", color:C.t3, textTransform:"uppercase", marginBottom:2}}>100-Mile Backyard Ultra · Training Plan</div>
            <div style={{fontSize:19, fontWeight:700, letterSpacing:"-0.02em", color:"#fff"}}>August 15, 2026</div>
            <div style={{fontSize:11, color:C.t3, marginTop:2}}>21 weeks · Running + Soccer + Strength + Recovery</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:36, fontWeight:700, color:C.gold, lineHeight:1}}>{daysLeft}</div>
            <div style={{fontSize:10, color:C.t3, textTransform:"uppercase", letterSpacing:"0.08em"}}>days to race</div>
          </div>
        </div>
        <div style={{marginTop:12}}>
          <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
            <span style={{fontSize:11, color:C.t3}}>Progress</span>
            <span style={{fontSize:11, color:C.t2}}>{doneCount} / {totalWorkouts} · {pct}%</span>
          </div>
          <div style={{height:3, background:C.b3, borderRadius:2}}>
            <div style={{height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#7c3aed,#fbbf24)", borderRadius:2, transition:"width 0.4s"}}/>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{display:"flex", background:C.bg2, borderBottom:`1px solid ${C.b2}`}}>
        {[["schedule","Schedule"],["sessions","Session Library"],["recovery","Recovery"],["notes","Notes"]].map(([k,l])=>(
          <button key={k} onClick={()=>{setTab(k); if(k==="schedule") setWeekNum(null);}}
            style={{padding:"10px 16px", background:"none", border:"none",
              borderBottom:`2px solid ${tab===k?"#7c3aed":"transparent"}`,
              color:tab===k?"#a78bfa":C.t3, fontSize:12, cursor:"pointer",
              fontWeight:tab===k?600:400, transition:"all 0.15s", whiteSpace:"nowrap"}}>
            {l}
          </button>
        ))}
      </div>

      {tab==="schedule" && <ScheduleView weekNum={weekNum} setWeekNum={setWeekNum} store={store} save={save} openSession={openSession}/>}
      {tab==="sessions" && <SessionsView sessKey={sessKey} setSessKey={setSessKey}/>}
      {tab==="recovery" && <RecoveryView recKey={recKey} setRecKey={setRecKey}/>}
      {tab==="notes"    && <NotesView store={store} save={save}/>}
    </div>
  );
}

// ─── SCHEDULE VIEW ────────────────────────────────────────────────────────────
function ScheduleView({weekNum, setWeekNum, store, save, openSession}) {
  if (weekNum) {
    const w = WEEKS[weekNum-1];
    return <WeekView week={w} store={store} save={save} openSession={openSession}
      onBack={()=>setWeekNum(null)}
      onPrev={()=>setWeekNum(Math.max(1,weekNum-1))}
      onNext={()=>setWeekNum(Math.min(21,weekNum+1))}/>;
  }
  return <WeekGrid store={store} onSelect={setWeekNum}/>;
}

function WeekGrid({store, onSelect}) {
  return (
    <div style={{padding:"18px 20px"}}>
      <div style={{display:"flex", borderRadius:8, overflow:"hidden", border:`1px solid ${C.b2}`, marginBottom:18}}>
        {Object.entries(PHASES).map(([k,p])=>(
          <div key={k} style={{flex:1, padding:"7px 10px", borderRight:`1px solid ${C.b2}`, display:"flex", alignItems:"center", gap:6}}>
            <div style={{width:6, height:6, borderRadius:"50%", background:p.d, flexShrink:0}}/>
            <div>
              <div style={{fontSize:11, fontWeight:600, color:p.c}}>{p.l}</div>
              <div style={{fontSize:10, color:C.t4}}>Wks {p.w}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{fontSize:10, letterSpacing:"0.1em", color:C.t4, marginBottom:12, textTransform:"uppercase"}}>Tap a week to view the full schedule</div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:8}}>
        {WEEKS.map(w=>{
          const p = PHASES[w.phase];
          const active = w.days.filter(d=>d[0]!=="rest");
          const done = active.filter((_,i)=>!!store.completed[`${w.n}-${w.days.indexOf(active[i])}`]).length;
          const allDone = active.length>0 && done===active.length;
          const wpct = active.length>0 ? Math.round(done/active.length*100) : 0;
          const hasMile = w.days.some(d=>d[4]);
          return (
            <button key={w.n} onClick={()=>onSelect(w.n)}
              style={{background:allDone?C.gbg:C.bg4, border:`1px solid ${allDone?C.gb:C.b2}`,
                borderRadius:8, padding:"11px", cursor:"pointer", textAlign:"left",
                position:"relative", width:"100%", transition:"border-color 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=p.d}
              onMouseLeave={e=>e.currentTarget.style.borderColor=allDone?C.gb:C.b2}>
              {allDone
                ? <div style={{position:"absolute",top:8,right:8,width:14,height:14,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff"}}>✓</div>
                : hasMile && <div style={{position:"absolute",top:9,right:9,width:5,height:5,borderRadius:"50%",background:C.gold}}/>
              }
              <div style={{fontSize:10,color:p.c,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>● {p.l}</div>
              <div style={{fontSize:17,fontWeight:700,color:"#fff",margin:"0 0 2px"}}>W{w.n}</div>
              <div style={{fontSize:10,color:C.t2,lineHeight:1.3,marginBottom:7}}>{w.title.length>30?w.title.slice(0,30)+"…":w.title}</div>
              <div style={{fontSize:12,color:p.c,fontWeight:600}}>{w.n===21?"Race":w.gw?`${w.mi}mi · game`:`${w.mi}mi`}</div>
              <div style={{marginTop:6,height:2,background:C.b2,borderRadius:1}}>
                <div style={{height:"100%",width:`${wpct}%`,background:p.d,borderRadius:1}}/>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{marginTop:18,padding:"12px 14px",background:C.bg2,borderRadius:8,border:`1px solid ${C.b2}`}}>
        <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:C.t4,marginBottom:8}}>Workout key</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"5px 12px"}}>
          {["easy","long","tempo","loop","nloop","btb","big50","game","soc","race","shake"].map(k=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:C.t2}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:RT[k].d}}/>{RT[k].l}
            </div>
          ))}
          <div style={{width:"100%",height:3}}/>
          {["strength","stability","mob","post","full","light"].map(k=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:C.t2}}>
              <div style={{width:5,height:5,borderRadius:2,background:ST[k].c}}/>{ST[k].l}
            </div>
          ))}
          <div style={{width:"100%",height:3}}/>
          {["sauna","ice","contrast"].map(k=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:C.t2}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:REC[k].c}}/>{REC[k].l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeekView({week, store, save, openSession, onBack, onPrev, onNext}) {
  const [expandedDay, setExpandedDay] = useState(null);
  const p = PHASES[week.phase];

  const toggle   = (di) => { const k=`${week.n}-${di}`; save({...store,completed:{...store.completed,[k]:!store.completed[k]}}); };
  const setActual= (di,v)=> { const k=`${week.n}-${di}`; save({...store,actual:{...store.actual,[k]:v}}); };
  const setRpe   = (di,v)=> { const k=`${week.n}-${di}`; save({...store,rpe:{...store.rpe,[k]:v}}); };
  const setNote  = (di,v)=> { const k=`${week.n}-${di}`; save({...store,dayNotes:{...store.dayNotes,[k]:v}}); };

  return (
    <div>
      <div style={{padding:"11px 20px",background:C.bg2,borderBottom:`1px solid ${C.b2}`,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <NavBtn label="← All weeks" onClick={onBack}/>
        <div style={{flex:1,minWidth:160}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:11,color:p.c,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>{p.l}</span>
            <span style={{color:C.b4}}>·</span>
            <span style={{fontSize:14,fontWeight:700,color:"#fff"}}>Week {week.n} — {week.title}</span>
            {week.gw && <span style={{fontSize:10,background:"#d9770620",color:"#fb923c",padding:"1px 7px",borderRadius:8,fontWeight:500}}>Game week</span>}
          </div>
          <div style={{fontSize:11,color:C.t4,marginTop:1}}>
            {week.n===21?"Race week":`${week.mi} mi target`}
            {week.days.some(d=>d[4]) && <span style={{marginLeft:10,color:C.gold}}>★ Milestone week</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <NavBtn label="← Prev" disabled={week.n===1} onClick={onPrev}/>
          <NavBtn label="Next →" disabled={week.n===21} onClick={onNext}/>
        </div>
      </div>

      <div style={{padding:"14px 20px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:8}}>
        {week.days.map((day,di)=>{
          const [runKey,miles,strKey,note,isMilestone,rec]=day;
          const run=RT[runKey]||RT.rest;
          const str=ST[strKey]||ST.none;
          const isDone=!!store.completed[`${week.n}-${di}`];
          const isRace=runKey==="race";
          const isExpanded=expandedDay===di;
          const actualMi=store.actual[`${week.n}-${di}`]||"";
          const rpeVal=store.rpe[`${week.n}-${di}`]||0;
          const noteVal=store.dayNotes[`${week.n}-${di}`]||"";
          const hasSess=!!SESSIONS[strKey];
          const isRest=runKey==="rest";

          return (
            <div key={di} style={{background:isDone?C.gbg:(isRace?"#041a10":C.bg4),
              border:`1px solid ${isDone?C.gb:(isMilestone?C.amber:C.b2)}`,
              borderRadius:8,overflow:"hidden",transition:"border-color 0.15s",
              outline:isRace?"1px solid #064e3b":"none"}}>
              <div style={{padding:"11px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                  <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.12em",color:C.t4,fontWeight:600}}>{DAYS[di]}</div>
                  <div style={{display:"flex",gap:5,alignItems:"center"}}>
                    {isMilestone&&!isDone&&<span style={{fontSize:11,color:C.gold}}>★</span>}
                    <div onClick={()=>toggle(di)} style={{width:16,height:16,borderRadius:4,
                      border:`1px solid ${isDone?C.green:C.b3}`,background:isDone?C.green:"transparent",
                      display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:9,color:"#fff"}}>
                      {isDone&&"✓"}
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:run.d,flexShrink:0}}/>
                  <span style={{fontSize:11,fontWeight:600,color:run.c}}>{run.l}</span>
                  {miles&&miles>0&&<span style={{fontSize:10,color:C.t3,marginLeft:"auto"}}>{miles}mi</span>}
                </div>
                {str.l&&(
                  <div style={{display:"flex",alignItems:"center",gap:4,cursor:hasSess?"pointer":"default"}}
                    onClick={()=>{if(hasSess)openSession(strKey);}}>
                    <div style={{width:5,height:5,borderRadius:2,background:str.c,flexShrink:0}}/>
                    <span style={{fontSize:10,color:str.c}}>{str.l}</span>
                    {hasSess&&<span style={{fontSize:9,color:C.t4,marginLeft:2}}>↗</span>}
                  </div>
                )}
                {rec&&rec.length>0&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:5}}>
                    {rec.map(r=><RecPill key={r} type={r}/>)}
                  </div>
                )}
                {note&&!isExpanded&&(
                  <div style={{marginTop:7,paddingTop:6,borderTop:`1px solid ${C.b2}`,fontSize:10,color:C.t2,lineHeight:1.4}}>{note}</div>
                )}
                {isRace&&<div style={{marginTop:5,fontSize:9,color:"#34d399",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>100 miles · ~30 hrs · 91 loops</div>}
              </div>
              {!isRest&&(
                <div onClick={()=>setExpandedDay(isExpanded?null:di)}
                  style={{padding:"5px 12px",borderTop:`1px solid ${C.b2}`,background:C.bg2,
                    cursor:"pointer",fontSize:10,color:C.t3,display:"flex",alignItems:"center",gap:4}}>
                  <span>{isExpanded?"▲":"▼"}</span>
                  <span>{isExpanded?"Close log":"Log workout"}</span>
                  {(actualMi||rpeVal||noteVal)&&!isExpanded&&<span style={{marginLeft:"auto",color:C.gold,fontSize:9}}>● logged</span>}
                </div>
              )}
              {isExpanded&&!isRest&&(
                <div style={{padding:"10px 12px",background:C.bg3,borderTop:`1px solid ${C.b2}`}}>
                  {note&&<div style={{fontSize:10,color:C.t2,lineHeight:1.4,marginBottom:8,padding:"6px 8px",background:C.bg2,borderRadius:4,borderLeft:`2px solid ${p.c}`}}>{note}</div>}
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:10,color:C.t3,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>Actual miles</div>
                    <input type="number" value={actualMi} onChange={e=>setActual(di,e.target.value)}
                      placeholder={miles||"0"} min="0" max="100" step="0.1"
                      style={{width:"80px",background:C.bg2,border:`1px solid ${C.b3}`,borderRadius:5,
                        padding:"4px 8px",color:C.t1,fontSize:12}}/>
                  </div>
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:10,color:C.t3,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>How did it feel?</div>
                    <div style={{display:"flex",gap:4}}>
                      {[1,2,3,4,5].map(v=>(
                        <button key={v} onClick={()=>setRpe(di,v)}
                          style={{width:28,height:28,borderRadius:5,
                            border:`1px solid ${rpeVal>=v?"#fbbf24":C.b3}`,
                            background:rpeVal>=v?"#fbbf2420":C.bg2,
                            color:rpeVal>=v?"#fbbf24":C.t3,cursor:"pointer",fontSize:11,fontWeight:600}}>
                          {v}
                        </button>
                      ))}
                      <span style={{fontSize:10,color:C.t3,alignSelf:"center",marginLeft:4}}>
                        {["","Easy","Solid","Hard","Very hard","Destroyed"][rpeVal]||""}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:C.t3,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>Notes</div>
                    <textarea value={noteVal} onChange={e=>setNote(di,e.target.value)}
                      placeholder="How did it go? Any pain or tightness? What you ate, weather, how you felt mentally..."
                      rows={3}
                      style={{width:"100%",boxSizing:"border-box",background:C.bg2,
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
        <div style={{margin:"0 20px 20px",padding:"12px 14px",background:C.bg2,borderRadius:8,borderLeft:`3px solid ${p.c}`}}>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:p.c,marginBottom:5,fontWeight:600}}>Coach's note — Week {week.n}</div>
          <div style={{fontSize:12,color:"#888",lineHeight:1.65}}>{week.tips}</div>
        </div>
      )}
    </div>
  );
}

// ─── SESSIONS VIEW ────────────────────────────────────────────────────────────
function SessionsView({sessKey, setSessKey}) {
  const [openEx, setOpenEx] = useState(null);
  const sess = SESSIONS[sessKey] || SESSIONS.strength;

  return (
    <div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",padding:"12px 20px 10px",borderBottom:`1px solid ${C.b2}`,background:C.bg2}}>
        {Object.entries(SESSIONS).map(([k,s])=>{
          const active=sessKey===k;
          return (
            <button key={k} onClick={()=>{setSessKey(k);setOpenEx(null);}}
              style={{padding:"4px 11px",borderRadius:6,border:`1px solid ${active?s.d:C.b2}`,
                background:active?s.d+"22":"transparent",color:active?s.c:C.t3,
                fontSize:11,cursor:"pointer",fontWeight:active?600:400}}>
              {s.l}
            </button>
          );
        })}
      </div>
      <div style={{padding:"18px 20px"}}>
        <div style={{marginBottom:16,paddingBottom:14,borderBottom:`1px solid ${C.b2}`}}>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.12em",color:sess.c,marginBottom:3,fontWeight:600}}>● {sess.when}</div>
          <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:5}}>{sess.l}</div>
          <div style={{fontSize:12,color:"#888",lineHeight:1.6,marginBottom:8}}>{sess.tag}</div>
          <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
            {[["Total",sess.total],["Rest",sess.rest],["Equipment",sess.equip]].map(([l,v])=>(
              <span key={l} style={{fontSize:11,color:C.t3}}>{l}: <span style={{color:C.t2}}>{v}</span></span>
            ))}
          </div>
        </div>
        {sess.exercises.map((ex,i)=>{
          const isOpen=openEx===i;
          return (
            <div key={i} style={{background:isOpen?C.bg2:C.bg4,border:`1px solid ${isOpen?sess.d+"60":C.b2}`,
              borderRadius:8,marginBottom:8,overflow:"hidden"}}>
              <div onClick={()=>setOpenEx(isOpen?null:i)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",cursor:"pointer"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.t1,marginBottom:1}}>{ex.name}</div>
                  <div style={{fontSize:11,color:sess.c}}>{ex.sets}</div>
                </div>
                <span style={{fontSize:10,color:C.t4,transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▼</span>
              </div>
              {isOpen&&(
                <div style={{padding:"0 14px 14px"}}>
                  <div style={{height:1,background:C.b2,margin:"0 0 12px"}}/>
                  <Field label="Tempo" val={ex.tempo}/>
                  <Field label="How to do it" val={ex.cue}/>
                  <div style={{background:C.bg,border:`1px solid ${sess.d}30`,borderLeft:`3px solid ${sess.d}`,
                    padding:"8px 10px",marginBottom:10}}>
                    <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",color:sess.c,marginBottom:4,fontWeight:600}}>Why this exercise</div>
                    <div style={{fontSize:12,color:"#888",lineHeight:1.6}}>{ex.why}</div>
                  </div>
                  <Field label="Progression across 21 weeks" val={ex.prog} small/>
                  <a href={ex.url} target="_blank" rel="noopener noreferrer"
                    style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:8,padding:"5px 10px",
                      borderRadius:6,border:`1px solid ${sess.d}40`,color:sess.c,fontSize:11,
                      textDecoration:"none",background:sess.d+"12"}}>
                    Watch tutorial on YouTube ↗
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
function RecoveryView({recKey, setRecKey}) {
  const prot = REC_PROTOCOLS[recKey];
  return (
    <div>
      <div style={{display:"flex",gap:6,padding:"12px 20px 10px",borderBottom:`1px solid ${C.b2}`,background:C.bg2,flexWrap:"wrap"}}>
        {Object.entries(REC_PROTOCOLS).map(([k,p])=>{
          const active=recKey===k;
          return (
            <button key={k} onClick={()=>setRecKey(k)}
              style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${active?REC[k].c:C.b2}`,
                background:active?REC[k].bg:"transparent",color:active?REC[k].c:C.t3,
                fontSize:12,cursor:"pointer",fontWeight:active?600:400}}>
              {p.title}
            </button>
          );
        })}
      </div>
      <div style={{padding:"18px 20px"}}>
        <div style={{marginBottom:16,paddingBottom:14,borderBottom:`1px solid ${C.b2}`}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.12em",color:prot.c,marginBottom:3,fontWeight:600}}>Starts {prot.start}</div>
              <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>{prot.title}</div>
              <div style={{fontSize:12,color:"#888"}}>{prot.subtitle}</div>
            </div>
            <a href={prot.url} target="_blank" rel="noopener noreferrer"
              style={{padding:"6px 12px",borderRadius:6,border:`1px solid ${prot.c}40`,color:prot.c,
                fontSize:11,textDecoration:"none",background:prot.bg,whiteSpace:"nowrap"}}>
              Watch protocol ↗
            </a>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8,marginBottom:16}}>
          {prot.specs.map(({l,v})=>(
            <div key={l} style={{background:C.bg3,borderRadius:7,padding:"10px 12px"}}>
              <div style={{fontSize:10,color:C.t4,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{l}</div>
              <div style={{fontSize:13,fontWeight:500,color:C.t1}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",color:C.t4,fontWeight:600,marginBottom:8}}>When to use it</div>
          {prot.when.map(({day,detail})=>(
            <div key={day} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.b2}`}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:prot.c,flexShrink:0,marginTop:4}}/>
              <div>
                <div style={{fontSize:12,fontWeight:500,color:C.t1,marginBottom:2}}>{day}</div>
                <div style={{fontSize:11,color:"#888",lineHeight:1.55}}>{detail}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",color:C.t4,fontWeight:600,marginBottom:8}}>Benefits</div>
          <div style={{background:prot.bg,borderRadius:8,border:`1px solid ${prot.c}30`,padding:"10px 14px"}}>
            {prot.benefits.map((b,i)=>(
              <div key={i} style={{display:"flex",gap:7,padding:"4px 0",fontSize:12,color:"#888",lineHeight:1.5}}>
                <span style={{color:prot.c,flexShrink:0,marginTop:1}}>+</span>{b}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",color:C.t4,fontWeight:600,marginBottom:8}}>Rules & cautions</div>
          <div style={{background:"#1a0a0a",borderRadius:8,border:"1px solid #3f1a1a",padding:"10px 14px"}}>
            {prot.rules.map((r,i)=>(
              <div key={i} style={{display:"flex",gap:7,padding:"4px 0",fontSize:12,color:"#999",lineHeight:1.5}}>
                <span style={{color:"#f87171",flexShrink:0,marginTop:1}}>!</span>{r}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NOTES VIEW ───────────────────────────────────────────────────────────────
function NotesView({store, save}) {
  const [activeWk, setActiveWk] = useState(1);
  const w = WEEKS[activeWk-1];
  const p = PHASES[w.phase];
  const noteVal = store.weekNotes?.[activeWk] || "";

  const setNote = (v) => save({...store, weekNotes:{...(store.weekNotes||{}), [activeWk]:v}});

  const weekStats = (n) => {
    const wk=WEEKS[n-1];
    const active=wk.days.filter(d=>d[0]!=="rest");
    const done=active.filter((_,i)=>!!store.completed?.[`${n}-${wk.days.indexOf(active[i])}`]).length;
    const totalMi=active.reduce((a,_,i)=>{const v=parseFloat(store.actual?.[`${n}-${i}`])||0;return a+v;},0);
    return {done, total:active.length, mi:totalMi.toFixed(1)};
  };

  return (
    <div style={{display:"flex",height:"calc(100vh - 110px)",minHeight:400}}>
      <div style={{width:72,borderRight:`1px solid ${C.b2}`,overflowY:"auto",flexShrink:0}}>
        {WEEKS.map(wk=>{
          const pp=PHASES[wk.phase];
          const stats=weekStats(wk.n);
          const hasNote=!!(store.weekNotes?.[wk.n]);
          return (
            <div key={wk.n} onClick={()=>setActiveWk(wk.n)}
              style={{padding:"8px 6px",borderBottom:`1px solid ${C.b2}`,cursor:"pointer",textAlign:"center",
                background:activeWk===wk.n?C.bg3:"transparent"}}>
              <div style={{fontSize:10,color:pp.c,fontWeight:600}}>W{wk.n}</div>
              <div style={{fontSize:9,color:C.t4,marginTop:1}}>{stats.done}/{stats.total}</div>
              {hasNote&&<div style={{width:4,height:4,borderRadius:"50%",background:C.gold,margin:"3px auto 0"}}/>}
            </div>
          );
        })}
      </div>
      <div style={{flex:1,padding:"16px 20px",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:10,color:p.c,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:600,marginBottom:2}}>{p.l} phase</div>
            <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>Week {w.n} — {w.title}</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <NavBtn label="← Prev" disabled={activeWk===1} onClick={()=>setActiveWk(Math.max(1,activeWk-1))}/>
            <NavBtn label="Next →" disabled={activeWk===21} onClick={()=>setActiveWk(Math.min(21,activeWk+1))}/>
          </div>
        </div>
        {(()=>{
          const stats=weekStats(activeWk);
          const days=WEEKS[activeWk-1].days;
          const logged=days.filter((_,i)=>store.dayNotes?.[`${activeWk}-${i}`]||store.actual?.[`${activeWk}-${i}`]);
          return (
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              {[["Workouts done",`${stats.done} / ${stats.total}`],["Miles logged",`${stats.mi} mi`],["Days with notes",`${logged.length}`]].map(([l,v])=>(
                <div key={l} style={{background:C.bg3,borderRadius:7,padding:"8px 12px",flex:1,minWidth:90}}>
                  <div style={{fontSize:10,color:C.t4,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:15,fontWeight:600,color:C.t1}}>{v}</div>
                </div>
              ))}
            </div>
          );
        })()}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:C.t4,fontWeight:600,marginBottom:8}}>Day logs</div>
          {WEEKS[activeWk-1].days.map((day,di)=>{
            const [runKey,miles,strKey,note]=day;
            if(runKey==="rest") return null;
            const key=`${activeWk}-${di}`;
            const isDone=!!store.completed?.[key];
            const actualMi=store.actual?.[key];
            const rpe=store.rpe?.[key];
            const dayNote=store.dayNotes?.[key];
            const run=RT[runKey]||RT.rest;
            return (
              <div key={di} style={{padding:"8px 10px",background:C.bg3,borderRadius:7,marginBottom:6,border:`1px solid ${isDone?C.gb:C.b2}`}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,fontWeight:600,color:C.t3}}>{DAYS[di]}</span>
                  <span style={{width:4,height:4,borderRadius:"50%",background:run.d,display:"inline-block"}}/>
                  <span style={{fontSize:11,color:run.c}}>{run.l}</span>
                  {actualMi&&<span style={{fontSize:10,color:C.t2,marginLeft:"auto"}}>{actualMi}mi</span>}
                  {rpe>0&&<span style={{fontSize:10,background:"#fbbf2420",color:"#fbbf24",padding:"1px 6px",borderRadius:8}}>RPE {rpe}</span>}
                  {isDone&&<span style={{fontSize:9,background:C.gb,color:"#4ade80",padding:"1px 6px",borderRadius:8}}>✓</span>}
                </div>
                {dayNote&&<div style={{fontSize:11,color:"#888",lineHeight:1.5,marginTop:4,paddingTop:4,borderTop:`1px solid ${C.b2}`}}>{dayNote}</div>}
                {!dayNote&&!actualMi&&<div style={{fontSize:10,color:C.t4,fontStyle:"italic",marginTop:3}}>No log yet</div>}
              </div>
            );
          })}
        </div>
        <div>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",color:C.t4,fontWeight:600,marginBottom:8}}>Weekly journal</div>
          <textarea value={noteVal} onChange={e=>setNote(e.target.value)}
            placeholder={`Week ${activeWk} reflection...\n\nHow did training go overall? Any patterns in fatigue or soreness? What's working? What needs to change? How's the knee holding up?`}
            rows={8}
            style={{width:"100%",boxSizing:"border-box",background:C.bg3,border:`1px solid ${C.b3}`,
              borderRadius:7,padding:"10px 12px",color:C.t1,fontSize:12,resize:"vertical",lineHeight:1.65}}/>
        </div>
      </div>
    </div>
  );
}
