/**
 * 进度旋转器组件
 */
type SpinnerComponent = {

    /**
     * 显示进度旋转器.(可选,默认以document.body元素作为父元素)
     *
     * @param parent {HTMLElement} 进度旋转器的父元素
     */
    open(parent?: HTMLElement): void

    /**
     * 关闭进度旋转器
     */
    close(): void;
}

/**
 * 进度旋转器
 *
 * @type {HTMLDivElement | Object}
 */
const element = document.createElement('div');

element.classList.add('spinner');
element.innerHTML = `<div class='arc-container'><div class='arc-left'><div class='arc-inner'></div></div><div class='arc-right'><div class='arc-inner'></div></div></div><svg class='spinner-inner-icon' viewBox='0 0 110 110'><path d='M60.06 97.9c-10.9 3.377-22.218-1.219-25.286-10.264s3.279-19.115 14.177-22.492a23.728 23.728 0 0 1 13.214-.318l-24.065-33.226a3.053 3.053 0 0 1-.322-2.05c1.516-8.335 15.833-11.13 15.833-11.13 14.412-2.02 16.482-7.42 16.482-7.42 4.515 14.346-5.172 20.056-5.172 20.056-5.372 4.396-14.546 3.644-14.546 3.644l22.814 38.016-.3-.192a14.766 14.766 0 0 1 1.345 2.882c3.066 9.045-3.277 19.115-14.174 22.494z'></path></svg>`;

/**
 * 进度旋转器组件
 */
const Spinner: SpinnerComponent = {
    open(parent = document.body) {
        parent.appendChild(element);
    },

    close() {
        element.remove();
    }
}

export default Spinner;
