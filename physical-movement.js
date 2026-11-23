import { categories, approvedExercises } from './physical-movement-content.js';

const entrance = document.getElementById('enter-movement');
const portal = document.getElementById('content-portal');
const movement = document.createElement('main');
movement.id = 'physical-movement';
movement.hidden = true;
portal.append(movement);

function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(text, onClick) {
  const node = element('button', text, 'studio-btn');
  node.type = 'button';
  node.addEventListener('click', onClick);
  return node;
}

function externalLink(text, href) {
  const link = element('a', text + ' (opens in a new tab)');
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function show(title, backLabel, goBack, compact = false) {
  movement.classList.toggle('movement-compact', compact);
  const header = element('header', '', 'movement-header');
  const heading = element('h1', title);
  heading.tabIndex = -1;
  header.append(heading, button(backLabel, goBack));
  const view = element('div', '', 'movement-view');
  view.append(header);
  movement.replaceChildren(view);
  movement.scrollTop = 0;
  return { heading, view };
}

function returnHome() {
  movement.hidden = true;
  document.body.classList.remove('show-movement', 'show-studio-grid');
  entrance.focus();
}

function showCategories(previousId) {
  const { heading, view } = show('Physical Movement', 'Return to Neural Orchard', returnHome);
  heading.after(element('p', 'Move well today. Stay strong for tomorrow.'));
  const grid = element('div', '', 'movement-doors');
  for (const category of categories) {
    const categoryButton = button(category.name, () => showCollection(category));
    const hasVideos = approvedExercises(category.id).length ||
      (category.id === 'space' && approvedExercises('dance').length);
    const status = hasVideos ? 'Exercises available' : 'In development';
    categoryButton.append(element('span', status, 'movement-status'));
    categoryButton.dataset.category = category.id;
    grid.append(categoryButton);
  }
  view.append(grid);
  const previousButton = [...grid.children].find(node => node.dataset.category === previousId);
  (previousButton ?? heading).focus();
}

function showCollection(category, returnToDance = false) {
  if (category.id === 'strength') {
    showStrength(category);
    return;
  }
  if (category.id === 'coordination') {
    showVideoMenu(category);
    return;
  }

  const { heading, view } = show(category.name, 'Back to exercise categories', () => showCategories(category.id));
  const collection = element('section', '', 'movement-collection');
  collection.append(
    element('p', category.description),
    element('h2', 'Move safely'),
    element('p', category.safety),
    element('p', 'Stop exercising if you develop chest pain, feel faint, or experience unusual shortness of breath. Seek emergency help for chest pain, fainting, or severe shortness of breath.'),
    element('h2', 'Exercise collection'),
    element('p', 'In development. Guided exercises will appear here after review.'),
  );
  let focusTarget = heading;
  if (category.id === 'space') {
    const dance = button('Dance', () => showDance(category));
    collection.append(dance);
    if (returnToDance) focusTarget = dance;
  }
  view.append(collection);
  focusTarget.focus();
}

function showDance(category) {
  const { heading, view } = show('Dance', 'Back to Move Through Space', () => showCollection(category, true), true);
  const collection = element('section', '', 'movement-collection');
  collection.append(
    element('p', 'Dance programs improve balance and mobility and reduce falls in older adults.'),
    externalLink('Research on dance, balance, and falls', 'https://pubmed.ncbi.nlm.nih.gov/32975570/'),
  );
  collection.append(videoLevels('dance'));
  view.append(collection);
  heading.focus();
}

function showStrength(category) {
  const { heading, view } = show(category.name, 'Back to exercise categories', () => showCategories(category.id), true);
  const collection = element('section', '', 'movement-collection');
  const why = element('details', '', 'movement-why');
  why.append(
    element('summary', 'Why?'),
    element('p', 'Regular strengthening helps you stay strong for everyday life and can support bone health through menopause and beyond.'),
    externalLink('Research on strength and bone health after menopause', 'https://pubmed.ncbi.nlm.nih.gov/28975661/'),
  );
  collection.append(
    element('p', 'Build strength for stairs, groceries, and getting up from a chair.'),
    why,
    videoLevels(category.id),
    element('p', category.safety, 'movement-attribution'),
    externalLink('Exercise adaptations for osteoporosis', 'https://doi.org/10.1136/bjsports-2021-104634'),
  );
  view.append(collection);
  heading.focus();
}

function videoLevels(categoryId) {
  const videos = approvedExercises(categoryId);
  const levels = element('ul', '', 'movement-video-list');
  levels.setAttribute('role', 'list');

  for (const level of ['Beginner', 'Intermediate', 'Advanced']) {
    const item = document.createElement('li');
    const disclosure = element('details', '', 'movement-why');
    disclosure.append(element('summary', level));
    const matches = videos.filter(video => video.level === level);
    if (!matches.length) {
      disclosure.append(element('p', 'Videos are in development.'));
    } else {
      const list = document.createElement('ul');
      for (const video of matches) {
        const entry = document.createElement('li');
        entry.append(
          externalLink(video.label, video.url),
          element('p', video.creator + ' · ' + video.duration),
          element('p', video.description),
        );
        list.append(entry);
      }
      disclosure.append(list);
    }
    item.append(disclosure);
    levels.append(item);
  }

  return levels;
}

function showVideoMenu(category, previousExercise) {
  const { heading, view } = show('Choose an exercise session', 'Back to exercise categories', () => showCategories(category.id), true);
  const collection = element('section', '', 'movement-collection');
  const exercises = approvedExercises(category.id);
  let returnTarget = heading;

  if (exercises.length) {
    const list = element('ul', '', 'movement-video-list');
    list.setAttribute('role', 'list');
    for (const exercise of exercises) {
      const entry = document.createElement('li');
      const option = button(exercise.label, () => showVideo(category, exercise));
      option.append(element('span', exercise.chooserSummary, 'movement-choice-summary'));
      if (exercise === previousExercise) returnTarget = option;
      const why = element('details', '', 'movement-why');
      const summary = element('summary', 'Why?');
      summary.setAttribute('aria-label', 'Why choose ' + exercise.label + '?');
      why.append(summary, element('p', exercise.why));
      for (const source of exercise.whySources) {
        why.append(externalLink(source.label, source.url));
      }
      entry.append(option, why);
      list.append(entry);
    }
    collection.append(list);
  } else {
    collection.append(element('h2', 'Collection in Development'));
  }

  view.append(collection);
  returnTarget.focus();
}

function showVideo(category, exercise) {
  const { heading, view } = show(exercise.label, 'Back to video choices', () => showVideoMenu(category, exercise), true);
  const detail = element('section', '', 'movement-collection');
  const link = externalLink('Watch on YouTube', exercise.url);
  link.className = 'movement-watch';
  detail.append(
    element('p', exercise.description),
    link,
    element('p', exercise.title + ' · ' + exercise.creator, 'movement-attribution'),
    element('p', 'Stop if you feel dizzy or unsteady.', 'movement-attribution'),
  );
  view.append(detail);
  heading.focus();
}

entrance?.addEventListener('click', () => {
  Studio.cancelBreathing();
  document.body.classList.add('show-studio-grid', 'show-movement');
  movement.hidden = false;
  showCategories();
});
