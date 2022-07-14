const books = [];
const BOOKS_STORAGE_KEY = 'BOOKSHELF_STORAGE';
const RENDER_EVENT = 'render-book';
const SAVE_EVENT = 'save';

const isStorageAvailable = () => {
  if (typeof Storage === 'undefined') {
    alert('Sorry, your browser does not support web storage');
    return false;
  }
  return true;
};

const saveData = () => {
  if (isStorageAvailable()) {
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
  }
};

const loadBook = () => {
  const data = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY));
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
};

function searchBook() {
  const searchBook = document.getElementById('searchTitle');
  const filter = searchBook.value.toLowerCase();
  const bookItem = document.querySelectorAll('.book-content');
  for (let i = 0; i < bookItem.length; i++) {
    txtValue = bookItem[i].textContent || bookItem[i].innerText;
    if (txtValue.toLowerCase().indexOf(filter) > -1) {
      bookItem[i].style.display = '';
    } else {
      bookItem[i].style.display = 'none';
    }
  }
}

const btnAddBook = document.querySelector('.btn-add-book');
const checkIsComplete = document.querySelector('#isComplete');

checkIsComplete.addEventListener('click', () => {
  if (checkIsComplete.checked) {
    btnAddBook.innerHTML = 'Masukan buku ke rak <strong>Selesai Dibaca</strong>';
  } else {
    btnAddBook.innerHTML = 'Masukan buku ke rak <strong>Belum Selesai Dibaca</strong>';
  }
});

const addBook = () => {
  const bookData = {
    id: +new Date(),
    title: document.querySelector('#bookTitle').value,
    author: document.querySelector('#bookAuthor').value,
    year: document.querySelector('#bookYear').value,
    isComplete: document.querySelector('#isComplete').checked,
  };
  books.push(bookData);
  document.dispatchEvent(new Event(RENDER_EVENT));
  swal.fire('Sukses!', 'Buku berhasil ditambahkan', 'success');
  saveData();
};

const makeBookList = (book) => {
  const article = document.createElement('article');
  article.classList.add('book-content');
  const textTitle = document.createElement('h3');
  textTitle.classList.add('book-title');
  textTitle.innerHTML = book.title;
  const textAuthor = document.createElement('p');
  textAuthor.innerHTML = `Penulis : ${book.author}`;
  const textYear = document.createElement('p');
  textYear.innerHTML = `Tahun : ${book.year}`;

  const containerAction = document.createElement('div');
  containerAction.classList.add('action');

  const buttonCheck = document.createElement('button');
  buttonCheck.classList.add('btn-check');
  buttonCheck.addEventListener('click', () => {
    book.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    swal.fire('Sukses!', 'Buku berhasil dipindahkan ke Rak selesai dibaca.', 'success');
    saveData();
  });
  const iconCheck = document.createElement('i');
  iconCheck.classList.add('fa-solid', 'fa-square-check');
  buttonCheck.append(iconCheck, ' Selesai baca');

  const buttonUndo = document.createElement('button');
  buttonUndo.classList.add('btn-undo');
  buttonUndo.addEventListener('click', () => {
    book.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    swal.fire('Sukses!', 'Buku berhasil dipindahkan ke Rak Belum selesai dibaca.', 'success');
    saveData();
  });
  const iconUndo = document.createElement('i');
  iconUndo.classList.add('fa-solid', 'fa-arrow-rotate-left');
  buttonUndo.append(iconUndo, ' Belum Selesai baca');

  const buttonEdit = document.createElement('button');
  buttonEdit.classList.add('btn-edit');
  const iconEdit = document.createElement('i');
  iconEdit.classList.add('fa-solid', 'fa-file-pen');
  buttonEdit.append(iconEdit, ' Edit');

  buttonEdit.addEventListener('click', async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Book Data',
      html: `
      <input type="hidden" id="idEdit" value="${book.id}" />
      <div class="w-full px-4 mb-5">
      <label for="bookTitle" class="text-base font-bold text-dark">Judul</label>
      <input type="text" name="bookTitle" id="bookTitleEdit" class="border w-full p-3 rounded-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" value="${book.title}" />
      </div>
      <div class="w-full px-4 mb-5">
      <label for="BookAuthor" class="text-base font-bold text-dark">Penulis</label>
      <input type="text" name="bookAuthor" id="bookAuthorEdit" class="border w-full p-3 rounded-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" value="${book.author}" />
       </div>
      <div class="w-full px-4 mb-5">
        <label for="  " class="text-base font-bold text-dark">Tahun</label>
        <input type="number" name="bookYear" id="bookYearEdit" class="border w-full p-3 rounded-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none" value="${book.year}" />
      </div>
    `,
      focusConfirm: false,
      preConfirm: () => {
        const bookData = {
          id: parseInt(document.getElementById('idEdit').value),
          title: document.getElementById('bookTitleEdit').value,
          author: document.getElementById('bookAuthorEdit').value,
          year: document.getElementById('bookYearEdit').value,
          isComplete: book.isComplete,
        };
        return bookData;
      },
    });

    if (formValues) {
      books.splice(books.indexOf(book), 1, formValues);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
      console.log(formValues);
      swal.fire('Sukses!', 'Data buku berhasil diedit.', 'success');
    }
  });

  const buttonDelete = document.createElement('button');
  buttonDelete.classList.add('btn-delete');
  buttonDelete.addEventListener('click', () => {
    swal
      .fire({
        title: 'Apakah anda yakin?',
        text: 'Akan menghapus buku ini',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, hapus!',
      })
      .then((result) => {
        if (result.isConfirmed) {
          Swal.fire('Berhasil!', 'Buku berhasil dihapus.', 'success');
          books.splice(books.indexOf(book), 1);
          document.dispatchEvent(new Event(RENDER_EVENT));
          saveData();
        }
      });
  });
  const iconDelete = document.createElement('i');
  iconDelete.classList.add('fa-solid', 'fa-trash');
  buttonDelete.append(iconDelete, ' Hapus');

  if (book.isComplete === false) {
    containerAction.append(buttonCheck, buttonEdit, buttonDelete);
  } else {
    containerAction.append(buttonUndo, buttonEdit, buttonDelete);
  }

  article.append(textTitle, textAuthor, textYear, containerAction);
  return article;
};

document.addEventListener('DOMContentLoaded', () => {
  const formInput = document.querySelector('#inputBook');
  formInput.addEventListener('submit', (e) => {
    e.preventDefault();
    addBook();
  });

  const formSearch = document.querySelector('#searchBook');
  formSearch.addEventListener('keyup', (e) => {
    e.preventDefault();
    const btnReset = document.querySelector('#btnReset');
    btnReset.classList.remove('hidden');
    btnReset.classList.add('absolute');
    searchBook();
  });
  formSearch.addEventListener('submit', (e) => e.preventDefault());

  const btnReset = document.querySelector('#btnReset');
  btnReset.addEventListener('click', () => {
    document.getElementById('searchBook').reset();
    searchBook();
  });

  if (isStorageAvailable()) {
    loadBook();
  }
});

document.addEventListener(RENDER_EVENT, () => {
  const incomplete = document.querySelector('#incompleteBookshelfList');
  const complete = document.querySelector('#completeBookshelfList');

  incomplete.innerHTML = '';
  complete.innerHTML = '';

  for (const book of books) {
    const listBook = makeBookList(book);
    book.isComplete ? complete.appendChild(listBook) : incomplete.appendChild(listBook);
  }
});
