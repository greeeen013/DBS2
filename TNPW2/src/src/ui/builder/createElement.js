// Tovární funkce pro vytváření DOM elementů – přejato ze vzorového projektu prepare/.
// Nahrazuje JSX nebo template engine – vše je čisté vanilla JS bez frameworků.

export function createElement(tag, options = {}, children = []) {
  const element = document.createElement(tag);

  if (options.className) {
    element.className = options.className;
  }

  for (const [key, value] of Object.entries(options)) {
    if (key !== 'className') {
      element.setAttribute(key, value);
    }
  }

  children.forEach((child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    } else if (typeof child === 'object' && child !== null) {
      const div = document.createElement('div');
      child.forEach((childSmall) => {
        if (childSmall instanceof Node) {
          div.appendChild(childSmall);
        } else {
          div.appendChild(document.createTextNode(childSmall));
        }
      });
      element.appendChild(div);
    }
  });

  return element;
}
