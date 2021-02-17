class ComponentUI {
  constructor(targetEl) {
    this.targetEl = targetEl;
  }

  onEvents() { throw new Error('Abstract function!'); }
}

class ContainerUI extends ComponentUI{
}

class ChildUI extends ComponentUI{
}

class CenterMenuChildUI extends ChildUI {
  onEvents() {
    this.targetEl.addEventListener('mouseover', this._onMouseOver);
    this.targetEl.addEventListener('mouseout', this._onMouseOut);
    this.targetEl.addEventListener('click', this._onClick);
  }

  _onMouseOver(evt) {
    evt.preventDefault();

    if (evt.target.previousElementSibling.checked === true)
      return;

    evt.target.classList.remove('cursor-default');
    evt.target.classList.add('color-gray');
  }

  _onMouseOut(evt) {
    evt.preventDefault();

    if (evt.target.previousElementSibling.checked === true)
      return;

    evt.target.classList.remove('cursor-default');
    evt.target.classList.remove('color-gray');
  }

  _onClick(evt) {
    evt.preventDefault();

    if (evt.target.previousElementSibling.checked === true)
      return;

    evt.target.previousElementSibling.checked = true;
    evt.target.classList.add('cursor-default');
    evt.target.classList.remove('color-gray');

    document.querySelector('#search-bar').dispatchEvent(
      new CustomEvent('change', {
        detail: {
          text: evt.target.innerText
        },
        bubbles: true,
        cancelable: true
      })
    );
  }
}

class SearchBarUI extends ContainerUI {
  onEvents() {
    this.targetEl.addEventListener('change', this._onChange.bind(this));
    this.backupInnerHTML;
  }

  _onChange(evt) {
    const searchBar = document.querySelector('#search-bar')

    // tmp
    if (this.backupInnerHTML) {
      searchBar.innerHTML = this.backupInnerHTML;
      searchBar.classList.remove('not-supported');
      this.backupInnerHTML = null;
    }

    const removable = document.querySelector('#search-bar > .removable');

    switch (evt.detail.text) {
      case '숙소':
        removable.hidden = false;
        document.querySelectorAll('#search-bar > .solid-rounded').forEach(el => el.classList.remove('search-bar-ver2'));
        break;
      case '체험':
        removable.hidden = true;
        document.querySelectorAll('#search-bar > .solid-rounded').forEach(el => el.classList.add('search-bar-ver2'));
        break;
      case '온라인 체험':
        this.backupInnerHTML = searchBar.innerHTML;
        searchBar.innerHTML = '지원안함';
        searchBar.classList.add('not-supported');
        break;
      default:
        throw new Error('Not reached!');
    }
  }
}


class SearchBarChildUI extends ChildUI {
  onEvents() {
    this.targetEl.addEventListener('mouseover', this.targetEl._onMouseOver);
    this.targetEl.addEventListener('mouseout', this.targetEl._onMouseOut);
  }

  _onMouseOver(evt) {
    evt.target.classList.add('background-color-gray');
  }

  _onMouseOut(evt) {
    evt.target.classList.remove('background-color-gray');
  }
}

class RightMenuChildWithPopupUI extends ChildUI {
  constructor(targetEl, popupMenu) {
    super(targetEl);
    this.popupMenu = popupMenu;  
  }

  onEvents() {
    this.targetEl.addEventListener('click', this._onClick.bind(this));
  }

  _onClick(evt) {
    if (this.popupMenu.isShown())
      return;

    this.popupMenu.targetEl.dispatchEvent(new Event('focus'));
  }
}

class PopupMenuUI extends ChildUI {
  constructor(targetEl) {
    super(targetEl);
    this.shown = false;
  }

  isShown() { return this.shown; }

  onEvents() {
    this.targetEl.addEventListener('focus', this._onFocus);
    this.targetEl.addEventListener('blur', this._onBlur);
  }

  _onFocus(evt) {
    evt.target.classList.remove('display-none');
    evt.target.focus();
    this.shown = true;
  }

  _onBlur(evt) {
    if (evt.relatedTarget === document.querySelector('#right-menu > .solid-rounded:first-child'))
      return;

    evt.target.classList.add('display-none');
    this.shown = false;
  }
}

function main() {
  const searchBar = new SearchBarUI(document.querySelector('#search-bar'));
  searchBar.onEvents();

  const searchBarChild = [...document.querySelectorAll('#search-bar > .pointable')].map(el => new SearchBarChildUI(el));
  searchBarChild.forEach(el => el.onEvents());

  const centerMenuChild = [...document.querySelectorAll('#center-menu > span')].map(el => new CenterMenuChildUI(el));
  centerMenuChild.forEach(el => el.onEvents());

  const popupMenu = new PopupMenuUI(document.querySelector('#popup-menu'));
  popupMenu.onEvents();

  const rightMenuChildWithPopup = new RightMenuChildWithPopupUI(document.querySelector('#right-menu > .solid-rounded:first-child'), popupMenu);
  rightMenuChildWithPopup.onEvents();
}

main();