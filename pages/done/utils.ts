export const getRandomColor = () => {
  let color = Math.floor(Math.random() * 16777215).toString(16)
  while (color.length < 6) {
    color = '0' + color
  }
  return `#${color}`
}
