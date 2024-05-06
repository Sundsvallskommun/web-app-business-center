import '@jestRoot/__mocks__/services.mock';
import '@jestRoot/__mocks__/context.mock';
import ShallowRenderer from 'react-test-renderer/shallow';
import MyDocument from '@pages/_document';

describe('MyDocument', () => {
  const renderer = new ShallowRenderer();
  renderer.render(<MyDocument />);
  const result = renderer.getRenderOutput();

  it('renders MyDocument unchanged', () => {
    expect(result).toMatchSnapshot();
  });
});
