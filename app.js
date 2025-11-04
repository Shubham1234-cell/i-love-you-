(() => {
  const el = (id) => document.getElementById(id);
  const stepSetup = el('step-setup');
  const stepGuard = { classList: { remove: () => {}, add: () => {} } }; // removed barrier
  const stepQuestions = el('step-questions');
  const stepFinish = el('step-finish');

  const proposerNameInput = el('proposerName');
  const proposerEmailInput = { value: '' };
  const partnerEmailInput = { value: '' };
  const guardInput = { value: '' };
  const guardError = { textContent: '' };
  const backToSetup = { addEventListener: () => {} };

  const questionText = el('question-text');
  const btnYes = el('btn-yes');
  const btnNo = el('btn-no');
  const attemptsLeft = el('attempts-left');

  const finishTitle = el('finish-title');
  const finishMessage = el('finish-message');
  const sendResults = el('send-results');
  const sendStatus = el('send-status');
  const restart = el('restart');

  const MAX_RETRIES = 8; // increased from 5 to 8
  let state = {
    proposerName: '',
    proposerEmail: '',
    partnerEmail: '',
    attempt: 0,
    accepted: false,
    history: [], // { question, answer }
    mode: 'proposal', // 'proposal' | 'yesFollowUp'
    yesIndex: 0
  };

  const baseQuestions = [
    (name) => `Will you be mine, now and always, ${name}?`,
    (name) => `Can I hold your hand through all of life's sunsets, ${name}?`,
    (name) => `${name}, shall we write our forever together?`,
    (name) => `May I call you my partner in every adventure, ${name}?`,
    (name) => `Imagine our names written in the stars — say yes, ${name}?`,
    (name) => `From coffee dates to late‑night talks, can I be your person, ${name}?`,
    (name) => `Let's turn moments into memories — will you choose us, ${name}?`,
    (name) => `One last time ${name} — will you say yes to us?`,
    (name) => `${name}, can we be each other's favorite hello and hardest goodbye?`,
    (name) => `Will you be my partner in crime and in everything else, ${name}?`,
    (name) => `${name}, shall we build our own little world together?`,
    (name) => `Can I be the reason you smile every day, ${name}?`,
    (name) => `${name}, will you let me love you through all seasons?`,
    (name) => `Shall we make beautiful music together, ${name}?`,
    (name) => `${name}, can we be each other's safe place?`,
    (name) => `Will you dance through life with me, ${name}?`,
  ];

  const noNudges = [
    'I brought flowers (and snacks).',
    'Plot twist: destiny ships us.',
    'A gentle nudge from Cupid…',
    'Okay but imagine our playlist together.',
    'I will share my fries. Always.',
  ];

  const funnyNoQuestions = [
    (name) => `Wait, ${name}... did you accidentally hit the wrong button?`,
    (name) => `${name}, are you sure? I even practiced this speech in the mirror!`,
    (name) => `Plot twist: I have pizza. Still no, ${name}?`,
    (name) => `${name}, I promise I'll let you pick the movie every time!`,
    (name) => `Last chance: I'll learn to cook your favorite dish, ${name}!`,
    (name) => `${name}, I have a backup plan involving a flash mob...`,
    (name) => `Okay ${name}, but what if I told you I'm secretly a superhero?`,
    (name) => `${name}, I'll even pretend to like your weird music taste!`,
    (name) => `${name}, I have a pet unicorn. Still not convinced?`,
    (name) => `Plot twist: I'm actually really good at doing dishes, ${name}!`,
    (name) => `${name}, I'll let you control the Netflix remote. Always.`,
    (name) => `What if I told you I know all the best dad jokes, ${name}?`,
    (name) => `${name}, I'll learn to love your morning coffee breath!`,
    (name) => `I have a collection of terrible puns just for you, ${name}!`,
    (name) => `${name}, I'll even watch your favorite reality show with you!`,
    (name) => `Plot twist: I'm secretly a professional cuddler, ${name}!`,
  ];

  const yesFollowUps = [
    (name) => `Yay! First plan together: dinner this weekend, ${name}?`,
    () => `Movie night with your favorite snacks?`,
    () => `May I plan a tiny surprise for you?`,
    () => `Sunset walk hand‑in‑hand soon?`,
    () => `Matching playlist date — shall we curate our soundtrack?`,
    () => `Picnic under the stars sometime this week?`,
    () => `Let’s take a silly photo together right now?`,
    () => `Bake cookies together and dance in the kitchen?`,
  ];

  function show(step) {
    [stepSetup, stepGuard, stepQuestions, stepFinish].forEach(s => s.classList.remove('active'));
    step.classList.add('active');
  }

  function validateEmail(v) {
    return /.+@.+\..+/.test(String(v).trim());
  }

  function resetFlow() {
    state.attempt = 0;
    state.accepted = false;
    state.history = [];
    state.mode = 'proposal';
    state.yesIndex = 0;
    updateQuestion();
  }

  function updateQuestion() {
    const name = state.proposerName;
    if (state.mode === 'proposal') {
      const idx = Math.min(state.attempt, baseQuestions.length - 1);
      const q = baseQuestions[idx](name);
      questionText.textContent = q;
      // Removed attempt counter display
    } else {
      const idx = Math.min(state.yesIndex, yesFollowUps.length - 1);
      questionText.textContent = yesFollowUps[idx](name);
      // Hide counts during sweet follow‑ups
      attemptsLeft.textContent = '';
    }
  }

  // Setup form
  document.getElementById('setup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const proposerName = proposerNameInput.value.trim();
    const proposerEmail = '';
    const partnerEmail = '';

    if (!proposerName) {
      alert('Please provide your name.');
      return;
    }
    state.proposerName = proposerName;
    state.proposerEmail = proposerEmail;
    state.partnerEmail = partnerEmail;

    // Skip name barrier and go straight to questions
    resetFlow();
    show(stepQuestions);
  });

  // Name barrier removed: no guard step

  btnYes.addEventListener('click', () => {
    state.history.push({ question: questionText.textContent, answer: 'Yes' });
    if (state.mode === 'proposal') {
      state.accepted = true;
      state.mode = 'yesFollowUp';
      state.yesIndex = 0;
      updateQuestion();
      return;
    }
    // yesFollowUp mode
    state.yesIndex += 1;
    if (state.yesIndex >= yesFollowUps.length) {
      finishTitle.textContent = 'Said YES — and plans are set!';
      finishMessage.textContent = 'Two hearts, one journey. Date night, movies, surprises and sunsets await.';
      show(stepFinish);
    } else {
      updateQuestion();
    }
  });

  btnNo.addEventListener('click', () => {
    state.history.push({ question: questionText.textContent, answer: 'No' });
    if (state.mode === 'proposal') {
      state.attempt += 1;
      if (state.attempt >= MAX_RETRIES) {
        finishTitle.textContent = "We'll keep this love safe";
        finishMessage.textContent = 'Even if today is not the day, this heart will wait.';
        show(stepFinish);
      } else {
        // Show funny question after "No"
        const funnyIdx = Math.min(state.attempt - 1, funnyNoQuestions.length - 1);
        const funnyQ = funnyNoQuestions[funnyIdx](state.proposerName);
        questionText.textContent = funnyQ;
        // Removed attempt counter display
      }
    } else {
      // If no during yesFollowUps, just move to the next sweet plan
      state.yesIndex += 1;
      if (state.yesIndex >= yesFollowUps.length) {
        finishTitle.textContent = 'Said YES — we will take it slow and sweet';
        finishMessage.textContent = 'We will craft every plan together, one lovely step at a time.';
        show(stepFinish);
      } else {
        updateQuestion();
      }
    }
  });

  sendResults.addEventListener('click', () => {
    // Show all responses in a formatted display
    let historyText = 'Our Beautiful Conversation:\n\n';
    state.history.forEach((item, index) => {
      historyText += `${index + 1}. ${item.question}\n   Answer: ${item.answer}\n\n`;
    });
    
    // Create a modal or alert to show the history
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.8); z-index: 1000; display: flex; 
      align-items: center; justify-content: center; padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white; border-radius: 12px; padding: 24px; 
      max-width: 600px; max-height: 80vh; overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    `;
    
    content.innerHTML = `
      <h3 style="margin: 0 0 16px; color: #c2185b; text-align: center;">Our Beautiful Conversation</h3>
      <div style="white-space: pre-line; line-height: 1.6; color: #333;">${historyText}</div>
      <div style="text-align: center; margin-top: 20px;">
        <button id="close-modal" style="
          background: linear-gradient(90deg, #ff3366, #ff5b8a); 
          color: white; border: none; padding: 12px 24px; 
          border-radius: 25px; cursor: pointer; font-weight: 600;
        ">Close</button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close modal functionality
    document.getElementById('close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  });

  restart.addEventListener('click', () => {
    show(stepSetup);
  });
})();


