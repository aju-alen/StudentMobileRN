import { StripeProvider } from '@stripe/stripe-react-native';
import { useEffect, useState, ReactElement } from 'react';
import { ipURL } from '../utils/utils';
import { axiosWithAuth } from '../utils/customAxios';

const StripeProviderWrapper = ({ children }: {children: ReactElement | ReactElement[]} ) => {
  const [publishableKey, setPublishableKey] = useState('');

  const fetchPublishableKey = async () => {
    const getPublishableKey = await axiosWithAuth.get(`${ipURL}/api/stripe/get-publisher-key`)
    setPublishableKey(getPublishableKey.data);
  };

  useEffect(() => {
    fetchPublishableKey();
  }, []);

  return (
    <StripeProvider
      publishableKey={publishableKey}

    >
        {children}
    </StripeProvider>
  );
}
export default StripeProviderWrapper;