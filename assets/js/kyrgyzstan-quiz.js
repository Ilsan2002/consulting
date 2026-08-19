/* Kenius — "Fun facts: Kyrgyzstan" quiz. Self-contained, no dependencies. */
(function () {
  "use strict";

  var QUESTIONS = [
    {
      q: "Roughly what share of Kyrgyzstan's land is mountainous?",
      choices: ["About 40%", "About 65%", "About 80%", "About 95%"],
      correct: 3,
      fact: "About 94–95% of the country sits above 1,000m — the Tian Shan and Pamir-Alay ranges cover almost everything except a few lowland valleys."
    },
    {
      q: "What is Issyk-Kul, one of the country's most famous landmarks?",
      choices: ["A desert canyon", "A mountain lake", "An ancient fortress", "A glacier field"],
      correct: 1,
      fact: "Issyk-Kul is the world's second-largest alpine lake by volume — and despite the altitude and winter cold around it, the lake itself almost never freezes (its name means \"warm lake\")."
    },
    {
      q: "Kyrgyzstan's traditional portable, felt-covered dwelling is called a:",
      choices: ["Yurt (boz üy)", "Izba", "Ger camp", "Kibitka tent"],
      correct: 0,
      fact: "The boz üy (grey house) is still used by herding families in summer pastures — its collapsible lattice frame and felt covering can be raised or packed away in under an hour."
    },
    {
      q: "What is the national epic poem of Kyrgyzstan, said to be one of the longest in the world?",
      choices: ["The Iliad", "Shahnameh", "Manas", "Beowulf"],
      correct: 2,
      fact: "The Epic of Manas runs to roughly half a million lines — about 20 times longer than the Odyssey and the Iliad combined — recited from memory by trained storytellers called manaschi."
    },
    {
      q: "Kyrgyzstan's national sport, played on horseback with a goat carcass, is called:",
      choices: ["Buzkashi's cousin, kok-boru", "Polo", "Chovgan", "Rodeo"],
      correct: 0,
      fact: "Kok-boru (\"grey wolf\") has teams on horseback compete to carry a goat or calf carcass into a scoring goal — it's now an official national sport and a fixture of the World Nomad Games."
    },
    {
      q: "What is the capital of Kyrgyzstan?",
      choices: ["Almaty", "Bishkek", "Tashkent", "Dushanbe"],
      correct: 1,
      fact: "Bishkek sits at the foot of the Ala-Too range — on a clear day the snow-capped peaks are visible right from the city's tree-lined avenues."
    },
    {
      q: "Kyrgyzstan is home to what's believed to be the world's largest natural forest of which tree?",
      choices: ["Pine", "Walnut", "Birch", "Cedar"],
      correct: 1,
      fact: "The Arslanbob walnut forest in the south is thought to be the largest wild walnut forest on Earth — some researchers trace the walnut's spread to markets worldwide back to groves like this one."
    },
    {
      q: "What is kymyz (kumis), a traditional Kyrgyz drink?",
      choices: ["Fermented mare's milk", "Green tea with butter", "A honey mead", "A yogurt soup"],
      correct: 0,
      fact: "Kymyz is mildly alcoholic, tangy, and traditionally drunk fresh in summer — it's been a staple of nomadic diets across Central Asia for centuries."
    },
    {
      q: "What is the currency of Kyrgyzstan?",
      choices: ["Tenge", "Som", "Manat", "Somoni"],
      correct: 1,
      fact: "The Kyrgyzstani som has been the national currency since 1993, replacing the Soviet and then Russian ruble after independence."
    },
    {
      q: "Eagle hunting — training golden eagles to hunt game from horseback — is a living tradition in Kyrgyzstan practiced mainly by:",
      choices: ["Fishermen", "Berkutchi (eagle hunters)", "Blacksmiths", "Shepherds only in winter"],
      correct: 1,
      fact: "Berkutchi train golden eagles over years of close partnership. The tradition is shared across Central Asia and is now recognized by UNESCO as intangible cultural heritage."
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
