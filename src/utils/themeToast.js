/*
 * After a cinematic intro, nudge the visitor to try the *other* theme's ride:
 * dark mode = hyperspace warp, light mode = cloud ascent. The button flips
 * the theme so the next tour / back-to-top plays the other effect.
 */
export function showThemeToast() {
  // never stack two
  document.querySelector('.theme-toast')?.remove()

  const isLight = document.documentElement.dataset.theme === 'light'
  const target = isLight ? 'dark' : 'light'

  const box = document.createElement('div')
  box.className = 'theme-toast'
  box.innerHTML = `
    <span class="theme-toast-text">${
      isLight
        ? 'Wanna try this in dark mode?'
        : 'Wanna try this in light mode?'
    }</span>
    <button class="theme-toast-btn" type="button">Switch to ${target === 'dark' ? 'Dark' : 'Light'}</button>
    <button class="theme-toast-close" type="button" aria-label="Dismiss">&times;</button>
  `
  document.body.appendChild(box)
  requestAnimationFrame(() => box.classList.add('is-in'))

  let timer
  const dismiss = () => {
    clearTimeout(timer)
    box.classList.remove('is-in')
    setTimeout(() => box.remove(), 400)
  }

  box.querySelector('.theme-toast-btn').addEventListener('click', () => {
    document.documentElement.dataset.theme = target
    try { localStorage.setItem('hari-theme', target) } catch { /* ignore */ }
    // keep the navbar toggle (and anything else) in sync
    window.dispatchEvent(new CustomEvent('themechange', { detail: target }))
    dismiss()
  })
  box.querySelector('.theme-toast-close').addEventListener('click', dismiss)

  timer = setTimeout(dismiss, 5000)
}
