import { Navbar, Nav, Container, NavDropdown, Badge, Button } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaHeart } from 'react-icons/fa';
import { LinkContainer } from './LinkContainer.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice.js';
import { logout } from '../slices/authSlice.js';
import { setLanguageExplicit, selectLanguage } from '../slices/languageSlice.js';
import SearchBox from './SearchBox.jsx';
import useT from '../hooks/useT.js';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const lang = useSelector(selectLanguage);
  const tr = useT();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLanguage = () => {
    dispatch(setLanguageExplicit(lang === 'zh' ? 'en' : 'zh'));
  };

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand data-testid="brand">{tr('nav.brand')}</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <SearchBox />
              <Button
                variant="outline-light"
                size="sm"
                className="mx-2 my-1"
                onClick={toggleLanguage}
                data-testid="lang-switch"
              >
                {lang === 'zh' ? 'EN' : '中文'}
              </Button>
              <LinkContainer to="/cart">
                <Nav.Link data-testid="nav-cart">
                  <FaShoppingCart /> {tr('nav.cart')}
                  {cartItems.length > 0 && (
                    <Badge pill bg="success" style={{ /* allow-style */ marginLeft: '5px' }}>
                      {cartItems.reduce((a, c) => a + c.qty, 0)}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>
              {userInfo ? (
                <>
                  <LinkContainer to="/wishlist">
                    <Nav.Link data-testid="nav-wishlist">
                      <FaHeart /> {tr('nav.wishlist')}
                    </Nav.Link>
                  </LinkContainer>
                  <NavDropdown title={userInfo.name} id="username">
                    <LinkContainer to="/profile">
                      <NavDropdown.Item>{tr('nav.profile')}</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={logoutHandler}>
                      {tr('nav.signout')}
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link data-testid="nav-signin">
                    <FaUser /> {tr('nav.signin')}
                  </Nav.Link>
                </LinkContainer>
              )}
              {userInfo && userInfo.isAdmin && (
                <NavDropdown title="Admin" id="adminmenu">
                  <LinkContainer to="/admin/productlist">
                    <NavDropdown.Item>{tr('nav.admin.products')}</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/orderlist">
                    <NavDropdown.Item>{tr('nav.admin.orders')}</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/userlist">
                    <NavDropdown.Item>{tr('nav.admin.users')}</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
