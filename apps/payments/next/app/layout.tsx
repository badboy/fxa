import ExampleHeader from '../components/ExampleHeader';
import './global.css';

export const metadata = {
  title: 'Welcome to payments/next',
  description: 'Generated by create-nx-workspace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ExampleHeader />
        {children}
      </body>
    </html>
  );
}