import { Layout } from '../components/ui/index.ts';

interface IEmptyPage {
  children: React.ReactNode;
}

const EmptyPage: React.FC<IEmptyPage> = ({ children }) => {
  return (
    <>
      <Layout.Main>
        {children}
      </Layout.Main>

      <Layout.Aside />
    </>
  );
};

export default EmptyPage;
