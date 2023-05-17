/**
 * Listen for an element to start animating and invoke a callback after all
 * animations have ended.
 *
 * Auto-ignores infinite animations.
 * @param {HTMLElement} element Element to watch
 * @param {()=>void} callback Invoke after all animations have finished
 */
export default function onAllAnimationsEnd(element, callback) {
  function monitorAnimations({ target }) {
    if (target !== element) return;
    const { animationName, animationPlayState, animationIterationCount } =
    window.getComputedStyle(element);
    
    const [playStates, iterations, animations] = [
      animationPlayState,
      animationIterationCount,
      animationName,
    ].map((str) => str.split(/,\s/));

    const targetAnimations = animations.filter(
      (_, i) => playStates[i] === 'running' && iterations[i] !== 'infinite'
    ); // Includes delayed animations
    
    function handleFinished({ animationName: endedName, target }) {
      if (target !== element) return;
      const animationIndex = targetAnimations.findIndex((n) => n === endedName);
      targetAnimations.splice(animationIndex, 1);
      if (targetAnimations.length) return;

      callback();
      element.removeEventListener('animationend', handleFinished);
    }

    element.addEventListener('animationend', handleFinished);
    // Can't use options.once since children can trigger it, would need to keep setting it.
    element.removeEventListener('animationstart', monitorAnimations);
  }

  element.addEventListener('animationstart', monitorAnimations);
}
