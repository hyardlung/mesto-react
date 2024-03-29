import {useState, useEffect} from 'react';

import '../index.css';
import {api} from '../utils/api';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import PopupWithForm from './PopupWithForm';
import ImagePopup from './ImagePopup';
import {CurrentUserContext} from '../contexts/CurrentUserContext';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';


export default function App() {
  // СТЕЙТ-ПЕРЕМЕННЫЕ
  const [cards, setCards] = useState([]);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser, setCurrentUser] = useState({
    name: '',
    about: '',
    avatar: '',
  });

  // хук, подтягивающий данные о пользователе и массив карточек с сервера
  useEffect(() => {
    Promise.all([
      api.getRemoteCards(),
      api.getUserData()
    ])
        .then(([remoteCards, userData]) => {
          setCards(remoteCards);
          setCurrentUser(userData);
        })
        .catch(err => console.log(err));
  }, []);

  // ОБРАБОТЧИКИ СОБЫТИЙ
  // открытие попапа редактирования профиля
  const handleEditProfileClick = () => {
    setIsEditProfilePopupOpen(true);
  }
  // открытие попапа добавления новой карточки
  const handleAddPlaceClick = () => {
    setIsAddPlacePopupOpen(true);
  }
  // открытие попапа обновления аватара пользователя
  const handleEditAvatarClick = () => {
    setIsEditAvatarPopupOpen(true);
  }
  // открытие попапа предпросмотра карточки
  const handleCardClick = ({name, link}) => {
    setSelectedCard({name, link});
    setIsImagePopupOpen(true);
  }
  // лайк карточки
  const handleCardLike = card => {
    const isLiked = card.likes.some(like => like._id === currentUser._id);
    api.changeLikeCardStatus(card._id, isLiked)
        .then(res => {
          setCards(state => state.map(c => c._id === card._id ? res : c))
        })
        .catch(err => console.log(err));
  }
  // удаление карточки
  const handleCardDelete = card => {
    api.deleteCard(card._id)
        .then(() => {
          setCards(state => state.filter(c => c._id !== card._id))
        })
        .catch(err => console.log(err));
  }

  // обработчик редактирования профиля
  const handleUpdateUser = newData => {
    api.editUserData(newData)
        .then(res => setCurrentUser(res))
        .catch(err => console.log(err))
        .finally(() => closeAllPopups());
  }
  // обработчик редактирования аватара
  const handleUpdateAvatar = newData => {
    api.updateAvatar(newData)
        .then(res => setCurrentUser(res))
        .catch(err => console.log(err))
        .finally(() => closeAllPopups());
  }
  // обработчик добавления карточки
  const handleAddPlaceSubmit = (card) => {
    api.sendCard(card)
        .then(newCard => setCards([newCard, ...cards]))
        .catch(err => console.log(err))
        .finally(() => closeAllPopups());
  }

  // закрытие любого из попапов
  const closeAllPopups = () => {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setSelectedCard(false);
    setIsImagePopupOpen(false);
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page root__page">
        <Header />
        <Main
            onEditProfile={handleEditProfileClick}
            onAddPlace={handleAddPlaceClick}
            onEditAvatar={handleEditAvatarClick}
            cards={cards}
            onCardClick={handleCardClick}
            onCardLike={handleCardLike}
            onCardDelete={handleCardDelete}
        />
        <Footer />
      </div>

      {/*попап редактирования профиля*/}
      <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          onUpdateUser={handleUpdateUser}
      />

      {/*попап редактирования аватара пользователя*/}
      <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
      />

      {/*попап добавления новой карточки*/}
      <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopups}
          onAddPlace={handleAddPlaceSubmit}
      />

      {/*попап предпросмотра изображения карточки*/}
      <ImagePopup
          isOpen={isImagePopupOpen}
          onClose={closeAllPopups}
          {...selectedCard}
      />

      {/*попап подтверждения удаления карточки*/}
      <PopupWithForm
          name="confirmationDeleteCard"
          formTitle="Вы уверены?"
          submitButtonTitle="Да"
      >
      </PopupWithForm>
    </CurrentUserContext.Provider>
  );
}