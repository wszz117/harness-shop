import { Container, Row, Col } from 'react-bootstrap';
import useT from '../hooks/useT.js';

const Footer = () => {
  const tr = useT();
  const currentYear = new Date().getFullYear();
  return (
    <footer>
      <Container>
        <Row>
          <Col className="text-center py-3">
            <p>
              {tr('nav.brand')} &copy; {currentYear} {tr('footer.copyright')}
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
