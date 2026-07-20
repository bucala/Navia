import React from 'react';

const CardModal = ({ card, onClose }) => {
  if (!card) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 border-2 border-gray-600 rounded-xl p-5 max-w-sm w-full text-white relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-2 right-3 text-2xl font-bold text-gray-400 hover:text-white" onClick={onClose}>&times;</button>
        <div className={ounded-lg overflow-hidden mb-4 }>
          <img src={card.imageUrl} alt={card.name} className="w-full h-auto object-cover" />
        </div>
        <h2 className="text-2xl font-bold text-center text-amber-400 mb-1">{card.name}</h2>
        <div className="flex justify-between text-xs text-gray-300 border-b border-gray-700 pb-2 mb-3">
          <span>Frakcia: <strong>{card.faction}</strong></span>
          <span>Rarita: <strong className={card.rarity === 'Legendary' ? 'text-amber-400' : ''}>{card.rarity}</strong></span>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg max-h-40 overflow-y-auto">
          <h3 className="text-sm text-gray-400 mb-1">Príbeh (Lore)</h3>
          <p className="text-sm italic text-gray-300 leading-relaxed">{card.loreSk || "Príbeh pre túto postavu ešte nebol objavený..."}</p>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
