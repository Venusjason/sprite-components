import { useEffect, useState } from "react"

export default () => {
  const [count, setCount] = useState(1)

  useEffect(() => {
    setInterval(() => {
      setCount(count + 1)
    }, 1000)
  }, [count])

  return <div>count: {count}</div>
}