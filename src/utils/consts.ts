const packageJson = require("../../package.json");

export const EXTENSION_NAME = packageJson.name;
export const EXTENSION_PUBLISHER = packageJson.publisher;
export const EXTENSION_ID = `${EXTENSION_PUBLISHER}.${EXTENSION_NAME}`;
export const EXTENSION_LIST_FILE_EXT = `${EXTENSION_NAME}.json`;
export const css = `
* {
  --primary-color: #10639c;
  --primary-color-hover: #1177bb;
}


.loader {
    width: 48px;
    height: 48px;
    border: 5px solid #FFF;
    border-bottom-color: #2190c2;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
      transform: rotate(0deg);
  }
  100% {
      transform: rotate(360deg);
  }
} 

.extension__container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
  padding: 0.875rem 1rem;
  gap: 1rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.extension__container:hover {
  background-color: rgba(255, 255, 255, 0.13);
  cursor: pointer;
}

.extension__info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.extension__info strong {
  font-size: 1.125rem;
}

.extension__info span,
p,
strong {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.extension__author {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}

.extension__install {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  font-size: 0.75rem;
  border-radius: 4px;
  padding: 4px 6px;
  min-height: 1rem;
}

.extension__install:hover {
  background-color: var(--primary-color-hover);
  color: white;
}
`;
