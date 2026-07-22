export default function SvgIcon({ svg, size = 24, color = 'currentColor', style = {} }) {
  if (!svg) return null
  const colored = svg
    .replace(/currentColor/g, color)
    .replace('<svg ', '<svg width="100%" height="100%" ')
  return (
    <div
      style={{
        width: size, height: size,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, ...style
      }}
      dangerouslySetInnerHTML={{ __html: colored }}
    />
  )
}
