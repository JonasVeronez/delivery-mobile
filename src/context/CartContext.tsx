import React, { createContext, useState } from "react";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  imageUrl: string; // 🔥 agora obrigatória
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (productId: number) => void;
  clear: () => void;
  getQty: (productId: number) => number;
};

export const CartContext = createContext<CartContextType>(
  {} as CartContextType
);

export const CartProvider: React.FC<any> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (item: Omit<CartItem, "quantity">) => {
    console.log("🔥 ADD RECEBIDO:", item);

    setItems((old) => {
      const exists = old.find(
        (i) => i.productId === item.productId
      );

      if (exists) {
        return old.map((i) =>
          i.productId === item.productId
            ? {
                ...i,
                quantity: i.quantity + 1,
                imageUrl: item.imageUrl // 🔥 força atualizar
              }
            : i
        );
      }

      return [
        ...old,
        {
          productId: item.productId,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl, // 🔥 salva sempre
          quantity: 1
        }
      ];
    });
  };

  const remove = (productId: number) => {
    setItems((old) => {
      const exists = old.find(
        (i) => i.productId === productId
      );

      if (!exists) return old;

      if (exists.quantity === 1) {
        return old.filter(
          (i) => i.productId !== productId
        );
      }

      return old.map((i) =>
        i.productId === productId
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
    });
  };

  const clear = () => setItems([]);

  const getQty = (productId: number) => {
    const item = items.find(
      (i) => i.productId === productId
    );
    return item?.quantity ?? 0;
  };

  return (
    <CartContext.Provider
      value={{ items, add, remove, clear, getQty }}
    >
      {children}
    </CartContext.Provider>
  );
};