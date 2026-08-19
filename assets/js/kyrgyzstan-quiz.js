/* Kenius — "Fun facts: Kyrgyzstan" quiz. Self-contained, no dependencies. */
(function () {
  "use strict";

  /* Every question hands the Kyrgyz name over as context in the stem — the
     player is never asked to recall or recognize a term they might not
     already know. Answer choices are facts/numbers, not competing proper nouns. */
  var QUESTIONS = [
    {
      q: "Roughly what share of Kyrgyzstan's land is mountainous?",
      choices: ["About 40%", "About 65%", "About 80%", "About 95%"],
      correct: 3,
      fact: "About 94–95% of the country sits above 1,000m — the Tian Shan and Pamir-Alay ranges cover almost everything except a few lowland valleys."
    },
    {
      q: "Issyk-Kul, Kyrgyzstan's largest lake, is unusual because:",
      choices: ["Despite freezing winters around it, the lake itself almost never freezes", "It was entirely man-made in the 1960s", "It has no fish or aquatic life", "It dries up completely every few years"],
      correct: 0,
      fact: "Issyk-Kul is the world's second-largest alpine lake by volume — and despite the altitude and winter cold around it, the lake itself almost never freezes (its name means \"warm lake\")."
    },
    {
      q: "A traditional Kyrgyz yurt — a round tent of felt over a collapsible wood frame — can usually be raised or packed away in:",
      choices: ["Under an hour", "About half a day", "Two full days", "It's never taken down once built"],
      correct: 0,
      fact: "This portable home (boz üy, \"grey house\") is still used by herding families in summer pastures — its collapsible lattice frame and felt covering go up or down fast by design."
    },
    {
      q: "Kyrgyzstan's national epic, passed down orally for generations, is considered one of the longest in the world because it runs to roughly:",
      choices: ["50 lines", "5,000 lines", "500,000 lines", "5 million lines"],
      correct: 2,
      fact: "The Epic of Manas runs to roughly half a million lines — about 20 times longer than the Odyssey and the Iliad combined — recited from memory by trained storytellers called manaschi."
    },
    {
      q: "In Kyrgyzstan's traditional national sport, riders on horseback compete to:",
      choices: ["Carry a goat or calf carcass into a scoring goal", "Knock a ball through a hoop with mallets", "Race three laps around a marked track", "Wrestle each other off their horses"],
      correct: 0,
      fact: "Kok-boru (\"grey wolf\") is that sport — it's now an official national sport and a fixture of the World Nomad Games."
    },
    {
      q: "Kyrgyzstan's capital sits at the foot of a mountain range — close enough that on a clear day:",
      choices: ["Snow-capped peaks are visible from the city's streets", "The city floods from spring meltwater every year", "Half the city is built directly into the mountainside", "The airport shuts down for avalanches each winter"],
      correct: 0,
      fact: "That's Bishkek, at the foot of the Ala-Too range — the peaks are visible right from the city's tree-lined avenues."
    },
    {
      q: "Kyrgyzstan is home to what's believed to be the world's largest natural forest of which kind of tree?",
      choices: ["Pine", "Birch", "Cedar", "Walnut"],
      correct: 3,
      fact: "The Arslanbob walnut forest in the south is thought to be the largest wild walnut forest on Earth — some researchers trace the walnut's spread to markets worldwide back to groves like this one."
    },
    {
      q: "Kymyz, a traditional Kyrgyz drink still enjoyed today, is made by:",
      choices: ["Fermenting mare's milk", "Steeping green tea with butter", "Fermenting honey and water", "Culturing yogurt with wild herbs"],
      correct: 0,
      fact: "Kymyz is mildly alcoholic, tangy, and traditionally drunk fresh in summer — it's been a staple of nomadic diets across Central Asia for centuries."
    },
    {
      q: "High in the mountains, Song-Kul — Kyrgyzstan's second major alpine lake — is unusual because:",
      choices: ["It has no permanent road access and freezes solid each winter", "It's the warmest lake in Central Asia year-round", "It's man-made and drained every decade for maintenance", "It sits below sea level in a desert basin"],
      correct: 0,
      fact: "At about 3,000m elevation, Song-Kul is reached only by mountain passes that close in winter — herding families set up summer yurt camps around its shores, then leave it frozen and empty come autumn."
    },
    {
      q: "Training golden eagles to hunt from horseback is a centuries-old Kyrgyz tradition. What makes the partnership between hunter and eagle distinctive?",
      choices: ["A hunter raises and works with the same eagle for years", "Eagles are wild-caught and released after a single hunt", "Only government-licensed handlers may train them", "The eagles are bred and raised entirely in captivity"],
      correct: 0,
      fact: "That close, years-long bond is why the tradition is now recognized by UNESCO as intangible cultural heritage — shared across Central Asia, not unique to Kyrgyzstan, but still practiced there today."
    },
    {
      q: "The mockumentary comedy Borat, starring a fictional Kazakh journalist, is often mistaken for a real window into Central Asian culture. How accurate is it, really?",
      choices: ["0% — pure satire, invented for comedy", "30% — a few real details buried in exaggeration", "50% — about half true, half invented", "100% — a faithful documentary"],
      correct: 0,
      fact: "Borat is fiction from top to bottom — its \"Kazakh\" customs were invented by its writers, and most of the film was shot in a village in Romania. Kazakhstan's government objected loudly at the time; it says nothing accurate about Kazakh, Kyrgyz, or any other Central Asian culture."
    },
    {
      q: "Kyrgyzstan's tallest mountain, Jengish Chokusu (also called Peak Pobeda), holds which distinction worldwide?",
      choices: ["It's the northernmost peak above 7,000m on Earth", "It's the tallest mountain in the world", "It's the only mountain never successfully climbed", "It sits exactly on the equator"],
      correct: 0,
      fact: "At 7,439m, Jengish Chokusu sits in the Tian Shan range on the Kyrgyzstan–China border. It's nowhere near the world's tallest overall, but it's recognized as the northernmost 7,000m+ summit anywhere on the planet."
    },
    {
      q: "In which year did Kyrgyzstan gain independence, as the Soviet Union dissolved?",
      choices: ["1985", "1991", "1995", "2001"],
      correct: 1,
      fact: "Kyrgyzstan declared independence on August 31, 1991 — one of several Soviet republics to do so that year as the USSR came apart."
    },
    {
      q: "Roughly how many people live in Kyrgyzstan today?",
      choices: ["About 2 million", "About 4 million", "About 7 million", "About 12 million"],
      correct: 2,
      fact: "Kyrgyzstan's population is around 7 million — small by global standards, and still growing, with roughly a fifth of the country living in or around the capital, Bishkek."
    },
    {
      q: "In 2010, Roza Otunbayeva became President of Kyrgyzstan after a revolution. What distinction did that give the country?",
      choices: ["The first country in Central Asia to have a woman as head of state", "The first country in Central Asia to hold any election", "The first Central Asian country to join the United Nations", "The first Central Asian country to abolish its military"],
      correct: 0,
      fact: "Otunbayeva served as interim, then elected, president from 2010 to 2011 — making Kyrgyzstan the first of the five Central Asian republics (alongside Kazakhstan, Tajikistan, Turkmenistan, and Uzbekistan) to have a woman lead the country."
    }
  ];

  var TIME_LIMIT = 15;
  var GLYPHS = ["▲", "◆", "●", "■"];

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var panels = {
    start: $("#panel-start"),
    question: $("#panel-question"),
    results: $("#panel-results")
  };

  var els = {
    qNum: $("#q-num"),
    qTimer: $("#q-timer"),
    qProgress: $("#q-progress"),
    qText: $("#q-text"),
    qAnswers: $("#q-answers"),
    qFeedback: $("#q-feedback"),
    btnNext: $("#btn-next"),
    btnStart: $("#btn-start"),
    btnReplay: $("#btn-replay"),
    rTitle: $("#r-title"),
    rSub: $("#r-sub"),
    rScore: $("#r-score"),
    rStreak: $("#r-streak")
  };

  var state, timerId;

  function showPanel(name) {
    Object.keys(panels).forEach(function (k) { panels[k].classList.toggle("active", k === name); });
  }

  function resetState() {
    state = { index: 0, score: 0, streak: 0, bestStreak: 0, answered: false };
  }

  function startQuiz() {
    resetState();
    showPanel("question");
    renderQuestion();
  }

  function renderQuestion() {
    var i = state.index, total = QUESTIONS.length, item = QUESTIONS[i];
    state.answered = false;

    els.qNum.textContent = "Question " + (i + 1) + " / " + total;
    els.qProgress.style.width = (i / total * 100) + "%";
    els.qText.textContent = item.q;
    els.qFeedback.innerHTML = "";
    els.btnNext.classList.remove("show");
    els.btnNext.textContent = i === total - 1 ? "See results →" : "Next question →";

    els.qAnswers.innerHTML = "";
    item.choices.forEach(function (choice, idx) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.innerHTML = '<span class="glyph" aria-hidden="true">' + GLYPHS[idx] + "</span>" + choice;
      btn.addEventListener("click", function () { lockAnswer(idx); });
      li.appendChild(btn);
      els.qAnswers.appendChild(li);
    });

    startTimer();
  }

  function startTimer() {
    clearInterval(timerId);
    var remaining = TIME_LIMIT;
    els.qTimer.textContent = String(remaining);
    timerId = setInterval(function () {
      remaining -= 1;
      els.qTimer.textContent = String(Math.max(remaining, 0));
      if (remaining <= 0) {
        clearInterval(timerId);
        if (!state.answered) lockAnswer(-1);
      }
    }, 1000);
  }

  function lockAnswer(chosenIdx) {
    if (state.answered) return;
    state.answered = true;
    clearInterval(timerId);

    var item = QUESTIONS[state.index];
    var buttons = $$("#q-answers button");
    var correct = chosenIdx === item.correct;

    buttons.forEach(function (btn, idx) {
      btn.disabled = true;
      if (idx === item.correct) btn.classList.add("correct");
      else if (idx === chosenIdx) btn.classList.add("wrong");
    });

    if (correct) {
      state.score += 1;
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    } else {
      state.streak = 0;
    }

    var verdict = chosenIdx === -1
      ? '<span class="verdict no">Time&rsquo;s up.</span>'
      : correct
        ? '<span class="verdict yes">Correct.</span>'
        : '<span class="verdict no">Not quite.</span>';
    els.qFeedback.innerHTML = verdict + "<p>" + item.fact + "</p>";
    els.btnNext.classList.add("show");
    els.btnNext.focus();
  }

  function nextQuestion() {
    state.index += 1;
    if (state.index >= QUESTIONS.length) {
      showResults();
    } else {
      renderQuestion();
    }
  }

  function showResults() {
    els.qProgress.style.width = "100%";
    var total = QUESTIONS.length, score = state.score;
    var pct = score / total;

    var title, sub;
    if (pct === 1) { title = "Perfect score."; sub = "All ten — you know Kyrgyzstan better than most guidebooks."; }
    else if (pct >= 0.7) { title = "Solid round."; sub = "You clearly know your way around the Tian Shan."; }
    else if (pct >= 0.4) { title = "Decent showing."; sub = "A few surprises in there — worth a second pass."; }
    else { title = "Room to grow."; sub = "Kyrgyzstan has a lot going on — play again and see what sticks."; }

    els.rTitle.textContent = title;
    els.rSub.textContent = sub;
    els.rScore.textContent = score + " / " + total;
    els.rStreak.textContent = String(state.bestStreak);

    showPanel("results");
  }

  els.btnStart.addEventListener("click", startQuiz);
  els.btnNext.addEventListener("click", nextQuestion);
  els.btnReplay.addEventListener("click", startQuiz);

  document.addEventListener("keydown", function (e) {
    if (!panels.question.classList.contains("active") || state.answered) return;
    var map = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
    var key = e.key.toLowerCase();
    if (key in map) lockAnswer(map[key]);
  });
})();
