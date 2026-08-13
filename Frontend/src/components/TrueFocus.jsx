import { useEffect, useRef, useState } from 'react'
import './TrueFocus.css'

const TrueFocus = ({
  sentence = 'True Focus',
  separator = ' ',
  manualMode = false,
  blurAmount = 5,
  borderColor = 'green',
  glowColor = 'rgba(0, 255, 0, 0.6)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  once = false,
  startDelay = 0,
  onComplete = null
}) => {
  const words = sentence.split(separator)
  const [currentIndex, setCurrentIndex] = useState(startDelay > 0 ? -1 : 0)
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const containerRef = useRef(null)
  const wordRefs = useRef([])
  const stepRef = useRef(0)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    if (manualMode) return
    let timeoutId
    let intervalId
    let completionTimeoutId

    timeoutId = setTimeout(() => {
      if (once) {
        stepRef.current = 0
        intervalId = setInterval(() => {
          if (stepRef.current <= words.length - 1) {
            setCurrentIndex(stepRef.current)
            stepRef.current++
          } else {
            clearInterval(intervalId)
            completionTimeoutId = setTimeout(
              () => onCompleteRef.current?.(),
              (animationDuration + pauseBetweenAnimations) * 1000
            )
          }
        }, (animationDuration + pauseBetweenAnimations) * 1000)
      } else {
        intervalId = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % words.length)
        }, (animationDuration + pauseBetweenAnimations) * 1000)
      }
    }, startDelay * 1000)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
      clearTimeout(completionTimeoutId)
    }
  }, [manualMode, once, startDelay, animationDuration, pauseBetweenAnimations, words.length])

  useEffect(() => {
    if (currentIndex === null || currentIndex === -1) return
    if (!wordRefs.current[currentIndex] || !containerRef.current) return

    const parentRect = containerRef.current.getBoundingClientRect()
    const activeRect = wordRefs.current[currentIndex].getBoundingClientRect()

    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height
    })
  }, [currentIndex, words.length])

  return (
    <div className="focus-container" ref={containerRef}>
      {words.map((word, index) => {
        const isActive = index === currentIndex
        return (
          <span
            key={index}
            ref={(el) => {
              wordRefs.current[index] = el
            }}
            className={`focus-word ${manualMode ? 'manual' : ''} ${isActive ? 'active' : ''}`}
            style={{
              filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
              '--border-color': borderColor,
              '--glow-color': glowColor,
              transition: `filter ${animationDuration}s ease`
            }}
          >
            {word}
          </span>
        )
      })}

      <div
        className="focus-frame"
        style={{
          left: focusRect.x,
          top: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: currentIndex >= 0 ? 1 : 0,
          transition: `left ${animationDuration}s ease, top ${animationDuration}s ease, width ${animationDuration}s ease, height ${animationDuration}s ease, opacity .3s ease`,
          '--border-color': borderColor,
          '--glow-color': glowColor
        }}
      >
        <span className="corner top-left" />
        <span className="corner top-right" />
        <span className="corner bottom-left" />
        <span className="corner bottom-right" />
      </div>
    </div>
  )
}

export default TrueFocus
