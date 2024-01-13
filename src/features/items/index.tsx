import { type Event } from 'nostr-tools';
import React from 'react';
import { FormattedNumber } from 'react-intl';

import { Button, Column, HStack, Text, Tooltip } from 'soapbox/components/ui';
import { type Account } from 'soapbox/schemas';

interface SoapboxItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  account: Account;
}

const account = {
  id: '1',
  acct: 'gleasonator.com',
  pleroma: {
    favicon: 'https://gleasonator.com/favicon.png',
  },
} as unknown as Account;

const items = [
  { id: '1', name: 'Angry Toast', image: 'http://localhost:8080/angry-toast.png', account, price: 3000 },
  { id: '2', name: 'Avocado', image: 'http://localhost:8080/avocado.png', account, price: 3000 },
  { id: '3', name: 'Candy Apple', image: 'http://localhost:8080/candy-apple.png', account, price: 50 },
  { id: '4', name: 'Computer', image: 'http://localhost:8080/computer.png', account, price: 100 },
  { id: '5', name: 'Cookie', image: 'http://localhost:8080/cookie.png', account, price: 100 },
  { id: '6', name: 'Diamond Cupcake', image: 'http://localhost:8080/diamond-cupcake.png', account, price: 250 },
  { id: '7', name: 'Disco Ball', image: 'http://localhost:8080/disco-ball.png', account, price: 700 },
  { id: '8', name: 'Doom Shield', image: 'http://localhost:8080/doom-shield.png', account, price: 800 },
  { id: '9', name: 'Doubloon', image: 'http://localhost:8080/doubloon.png', account, price: 1000 },
  { id: '10', name: 'Gamer Girl Bathwater', image: 'http://localhost:8080/gamer-girl-bathwater.png', account, price: 9999 },
  { id: '11', name: 'Gamething', image: 'http://localhost:8080/gamething.png', account, price: 2500 },
  { id: '12', name: 'Gold Fiddle', image: 'http://localhost:8080/gold-fiddle.png', account, price: 7000 },
  { id: '13', name: 'Holy Bible', image: 'http://localhost:8080/holy-bible.png', account, price: 0 },
  { id: '14', name: 'Mushroom', image: 'http://localhost:8080/mushroom.png', account, price: 1000 },
  { id: '15', name: 'Owl Clock', image: 'http://localhost:8080/owl-clock.png', account, price: 1000 },
  { id: '16', name: 'Piggy Bank', image: 'http://localhost:8080/piggy-bank.png', account, price: 500 },
  { id: '17', name: 'Royal Crown', image: 'http://localhost:8080/royal-crown.png', account, price: 1000000 },
  { id: '18', name: 'Tinfoil Hat', image: 'http://localhost:8080/tinfoil-hat.png', account, price: 100 },
  { id: '19', name: 'Vegan Burger', image: 'http://localhost:8080/vegan-burger.png', account, price: 0 },
  { id: '20', name: 'Voodoo Doll', image: 'http://localhost:8080/voodoo-doll.png', account, price: 0 },
] as unknown as SoapboxItem[];

interface IItems {
  badges: Event[];
}

const Items: React.FC<IItems> = () => {
  return (
    <Column label='Item Shop'>
      <div className='grid grid-cols-4 gap-6'>
        {items.map((item) => <Item {...item} />)}
      </div>
    </Column>
  );
};

const Item: React.FC<SoapboxItem> = ({ id, name, image, account, price }) => {
  const favicon = account?.pleroma?.favicon;

  return (
    <div key={id} className='flex flex-col gap-3 text-center'>
      <img
        className='aspect-1 rounded-lg object-contain'
        src={image}
        alt={name}
      />

      <div>
        <Text weight='bold'>{name}</Text>
        <HStack space={2} alignItems='center'>
          <Text size='xs' theme='muted'>@{account.acct}</Text>
          {favicon && (
            <Tooltip text={`Item issued by ${account.acct}`}>
              <img src={favicon} alt={account.acct} className='h-3 w-3' />
            </Tooltip>
          )}
        </HStack>
      </div>

      <Button
        className='mt-auto'
        icon={require('@tabler/icons/bolt.svg')}
      >
        {price === 0 ? 'Free' : <FormattedNumber value={price} />}
      </Button>
    </div>
  );
};

export default Items;