import React, { useState, useEffect } from 'react';
import { Menu, Search, ShoppingBag, X, ChevronRight, ChevronLeft, ArrowRight, MapPin, Trash2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './firebase';

// --- Types & Data ---

type Product = {
  id: number;
  name: string;
  section: string;
  category: string;
  subCategory?: string;
  price: string;
  images: string[];
  colors: string[];
  sizes: string[];
  description: string;
  badge?: string;
};

type CartItem = {
  id: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
  price: number;
};

const productsData: Product[] = [
  {
    id: 1,
    name: 'Conjunto maria',
    section: 'ropa-interior',
    category: 'Conjuntos',
    price: '$42.000',
    images: [
  '/imagenes/ropainterior/conjunto-maria/1.jpg',
  '/imagenes/ropainterior/conjunto-maria/2.jpg',
  '/imagenes/ropainterior/conjunto-maria/3.jpg',
],
    colors: ['Biege', 'Negro', 'Blanco', 'Rosa'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Corpiño de puntilla falso aro, con elastico en el busto y bombacha de lycra de algodon cola less con detalles de puntilla,',
    
  },
  
  {
    id: 12,
    name: 'Colaless/Vedetina Algodón',
    section: 'ropa-interior',
    category: 'Bombachas',
    subCategory: 'Unidad',
    price: '$11.600',
    images: [
  '/imagenes/ropainterior/bombacha-unidad/colalesvedetina-algodon.jpg',
  '/imagenes/ropainterior/bombacha-unidad/colales-algodon.jpeg',
  
],
    colors: ['Blanco', 'Negro', 'Beige','Gris', 'Gris Oscuro' ],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Bombacha colales tiro medio, confeccionada de lycra de algodon.'
  },
  {
    id: 13,
    name: 'Colaless/Vedetina Puntilla',
    section: 'ropa-interior',
    category: 'Bombachas',
    subCategory: 'Unidad',
    price: '$12.300',
    images: [
  '/imagenes/ropainterior/bombacha-unidad/colalesvedetina-algodon-puntilla.jpg',
  
],
    colors: ['Blanco', 'Negro', 'Gris', 'Beige', 'Gris Melange' ],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Bombacha colales tiro medio, confeccionada de lycra de algodon. Detalles de puntilla al tono.'
  },
  {
    id: 14,
    name: 'Regulable Valeria-Puntilla',
    section: 'ropa-interior',
    category: 'Bombachas',
    subCategory: 'Unidad',
    price: '$12.500',
    images: [
  '/imagenes/ropainterior/bombacha-unidad/regulablevaleria-puntilla.jpg',
  
],
    colors: ['Blanco', 'Negro', 'Gris', 'Verde Agua', 'Bordeau' ],
    sizes: ['1 (85-90)', '2 (95-100)'],
    description: 'Bombacha regulable de puntilla, con microtul en espalda, tiras regulables con reguladores y arandelas metalicos, refuerzo de algodon en la zona intima.  '
  },
  {
    id: 17,
    name: 'Colaless/Vedetina Morley',
    section: 'ropa-interior',
    category: 'Bombachas',
    subCategory: 'Unidad',
    price: '$11.600',
    images: [
      '/imagenes/ropainterior/bombacha-unidad/colales-vedetina-print.jpeg',
      '/imagenes/ropainterior/bombacha-unidad/blanco-morley.png'
    ],
    colors: ['Print', 'Blanco', 'Negro', 'Beige'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Morley estampado, bombacha tiro medio con refuerzo de algodón.'
  },
  {
    id: 18,
    name: 'Vedetina Blanco y Negro',
    section: 'ropa-interior',
    category: 'Bombachas',
    subCategory: 'Unidad',
    price: '$11.600',
    images: [
      '/imagenes/ropainterior/bombacha-unidad/colales-blancoynegro.jpeg'
    ],
    
    colors: ['Blanco', 'Negro', 'Beige','Gris', 'Gris Oscuro' ],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Bombacha colaless en blanco y negro, clásico y elegante con detalle de acabado en microtul.'
  },
  {
    id: 19,
    name: 'Regulable Algodón',
    section: 'ropa-interior',
    category: 'Bombachas',
    subCategory: 'Unidad',
    price: '$12.000',
    images: [
      '/imagenes/ropainterior/bombacha-unidad/regulable-algodon.jpg'
    ],
      colors: ['Blanco', 'Negro', 'Beige', 'Gris Melange', ],
    sizes: ['1 (85-90)', '2 (95-100)'],
    description: 'Bombacha regulable de algodón con ajuste suave y refuerzo interno. Ideal para uso diario.'
  },
  {
    id: 101,
    name: 'Pack X2 colaless/vedetina algodón',
    section: 'ropa-interior',
    category: 'Bombachas',
    subCategory: 'Pack',
    price: '$22.000',
    images: ['/imagenes/ropainterior/bombachas-pack/colalesvedetina-algodon-pack.jpg',

    ],
       colors: ['Blanco', 'Negro', 'Beige','Gris', 'Gris Oscuro' ],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Bombacha  tiro medio, confeccionada de lycra de algodon.',
    badge: 'Pack'
  },
  {
    id: 102,
    name: 'Pack X2 algodón con puntilla',
    section: 'ropa-interior',
    category: 'Bombachas',
    subCategory: 'Pack',
    price: '$22.700',
    images: [
     '/imagenes/ropainterior/bombachas-pack/colalesvedetina-algodon-puntilla-pack.jpg',
      
    ],
      colors:['Blanco', 'Negro', 'Bei ge','Gris', 'Gris Oscuro' ],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Bombacha tiro medio, confeccionada de lycra de algodon. Detalles de puntilla al tono.',
    badge: 'Pack'
  },
  {
    id: 103,
    name: 'Pack X2 regulable Valeria Puntilla',
    section: 'ropa-interior',
    category: 'Bombachas',
    subCategory: 'Pack',
    price: '$24.000',
    images: [
      '/imagenes/ropainterior/bombachas-pack/regulablevaleria-puntilla-pack.jpg',
      
    ],
    colors: ['Blanco', 'Negro', 'Gris', 'Verde Agua', 'Bordeau' ],
    sizes: ['1 (85-90)', '2 (95-100)'],
    description: 'Bombacha regulable de puntilla, con microtul en espalda, tiras regulables con reguladores y arandelas metalicos, refuerzo de algodon en la zona intima.  ',
    badge: 'Pack'
  },
  {
    id: 104,
    name: 'Pack X2 colales/ vedetina morley',
    section: 'ropa-interior',
    category: 'Bombachas',
    subCategory: 'Pack',
    price: '$22.000',
    images: [
      '/imagenes/ropainterior/bombachas-pack/colalesvedetina-print-pack.jpg',
      '/imagenes/ropainterior/bombacha-unidad/colales-vedetina-print.jpeg'
      
    ],
    colors: ['Blanco', 'Negro', 'Beige','Print' ],
   sizes: ['1', '2', '3', '4', '5'],
    description: 'Bombacha tiro medio, confeccionada de morley estampado, refuerzo de algodon en la zona intima.',
    badge: 'Pack'
  },
  {
    id: 105,
    name: 'Pack X2 Blanco y Negro',
    section: 'ropa-interior',
    category: 'Bombachas',
    subCategory: 'Pack',
    price: '$21.200',
    images: ['/imagenes/ropainterior/bombachas-pack/colales-blancoynegro-pack.jpeg',],
    colors: ['Blanco', 'Negro'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Bombacha tiro medio, confeccionada de lycra de algodon con recortes en delantero y espalda de puntilla, refuerzo de algodon en la zona intima  ',
    badge: 'Pack'
  },
  {
    id: 20,
    name: 'Pack X2 Regulable Algodón',
    section: 'ropa-interior',
    category: 'Bombachas',
    subCategory: 'Pack',
    price: '$23.500',
    images: [
      '/imagenes/ropainterior/bombachas-pack/regulable-algodon-pack.jpg',
      '/imagenes/ropainterior/bombacha-unidad/regulable-algodon1.jpg',
      
    ],
    colors: ['Blanco', 'Negro', 'Beige', 'Gris Melange'],
    sizes: ['1 (85-90)', '2 (95-100)'],
    description: 'Bombacha regulable de lycra de algodon, tiras regulables con reguladores y arandelas metalicos, refuerzo de algodon en la zona intima.',
    badge: 'Pack'
  },
  
  {
    id: 6,
    name: 'Conjunto Sofia',
    section: 'ropa-interior',
    category: 'Conjuntos',
    price: '$42.200',
    images: [
  '/imagenes/ropainterior/conjunto-sofia/sofiablanco.jpg',
  '/imagenes/ropainterior/conjunto-sofia/sofianegro.jpg',
],
    colors: ['Biege', 'Negro', 'Blanco'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Corpiño de microtul con detalle en puntilla, bombacha vedetina regulable de seda fria y microtul en espalda. '
  },
  {
    id: 9,
    name: 'Conjunto Ines',
    section: 'ropa-interior',
    category: 'Conjuntos',
    price: '$41.700',
    images: [
      '/imagenes/ropainterior/conjunto-ines/ines.jpg',
      '/imagenes/ropainterior/conjunto-ines/ines1.jpg',
      '/imagenes/ropainterior/conjunto-ines/ines2.jpg',
      '/imagenes/ropainterior/conjunto-ines/ines3.jpg',
      
    ],
    colors: [ 'Negro'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Corpiño de microtul con detalles print en terciopelo y forrado de microtul, en la base tiene un elastico de 3,5 cm forrado en seda fria super suave, bombacha colales tiro medio del mismo material que el corpiño con refuerzo de algodon en la zona intima y  breteles anchos de 2 cm para un mejor agarre. '
  },
  {
    id: 10,
    name: 'Conjunto Macarena',
    section: 'ropa-interior',
    category: 'Conjuntos',
    price: '$46.500',
    images: [
      '/imagenes/ropainterior/conjunto-macarena/macarena-blanco.jpg',
      '/imagenes/ropainterior/conjunto-macarena/macarena-negro.jpg',
      '/imagenes/ropainterior/conjunto-macarena/macarena-beige.jpg'
    ],
    colors: ['Coral', 'Negro', 'Beige'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Remera de jersey de algodon, con detalle de puntilla en escote y sisa, tiras regulables con arandelas y reguladores de plastico. Bombacha colales de puntilla y microtul, tiro medio, con refuerzo de algodon en la zona intima.  '
  },
  {
    id: 11,
    name: 'Conjunto Eugenia',
    section: 'ropa-interior',
    category: 'Conjuntos',
    price: '$42.000',
    images: [
      '/imagenes/ropainterior/conjunto-eugenia/eugeniablanco.jpg',
      '/imagenes/ropainterior/conjunto-eugenia/eugeniablanco1.jpg',
      '/imagenes/ropainterior/conjunto-eugenia/eugenianegro.jpg'
    ],
     colors: ['Coral', 'Negro', 'Beige'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Corpiño de microtul forrado en puntilla, bombacha colales de lycra de algodon con detalle de puntilla en los costados '
  },
  
  {
    id: 27,
    name: 'Pijama Flores',
    section: 'pijamas',
    category: 'Conjunto Verano',
    price: '$46.500',
    images: [
      '/imagenes/pijamas/conjuntos-verano/Pijama-Flores/flores-pastel.jpeg',
      '/imagenes/pijamas/conjuntos-verano/Pijama-Flores/pijama-flores.jpg',
      '/imagenes/pijamas/conjuntos-verano/Pijama-Flores/pijama-flores1.jpg',
      '/imagenes/pijamas/conjuntos-verano/Pijama-Flores/pijama-flores.jpg',
      '/imagenes/pijamas/conjuntos-verano/Pijama-Flores/pijama-celeste.jpeg'
    ],
    colors: ['Lila', 'Celeste', 'Marron'],
    sizes: ['1', '2', '3', '4','5'],
    description: 'Confeccionado con morley viscosa, el short posee elastico en cintura para un mejor agarre. Musculosa con detalle en puntilla blanca y tiras regulables.'
  },
  {
    id: 28,
    name: 'Pijama Liso',
    section: 'pijamas',
    category: 'Conjunto Verano',
     price: '$46.500',
    images: [
      '/imagenes/pijamas/conjuntos-verano/Pijama-Liso/pijamaliso.jpg',
      '/imagenes/pijamas/conjuntos-verano/Pijama-Liso/pijamalisonegro.jpg'
    ],
    colors: ['Gris', 'Negro'],
    sizes: ['1', '2', '3', '4','5'],
    description: 'Confeccionado con morley viscosa, el short posee elastico en cintura para un mejor agarre. Musculosa con detalle en puntilla al tono de la tela y tiras regulables.'
  },
  {
    id: 29,
    name: 'Pijama Puntilla',
    section: 'pijamas',
    category: 'Conjunto Verano',
    price: '$45.000',
    images: [
      '/imagenes/pijamas/conjuntos-verano/Pijama-Puntilla/pijama-puntilla2.jpg',
      '/imagenes/pijamas/conjuntos-verano/Pijama-Rayas/pijama-puntilla.jpg',
      '/imagenes/pijamas/conjuntos-verano/Pijama-Puntilla/pijama2.jpg'
    ],
    colors: ['Negro','Gris con rayas', 'Marron con flores'],
    sizes: ['1', '2', '3', '4','5'],
    description: 'Confeccionado con morley viscosa, el short posee elastico en cintura para un mejor agarre. Musculosa cuello redondo con detalle en puntilla blanca y tiras regulables.'
  },
  {
    id: 30,
    name: 'Pijama Rayas',
    section: 'pijamas',
    category: 'Conjunto Verano',
   price: '$46.500',
    images: [
      
      '/imagenes/pijamas/conjuntos-verano/Pijama-Rayas/pijamarayas.jpg'
    ],
    colors: ['Blanco'],
    sizes: ['1', '2', '3', '4','5'],
    description: 'Confeccionado con morley viscosa, el short posee elastico en cintura para un mejor agarre. Musculosa con detalle en puntilla al tono de la tela y tiras regulables.'
  },
  {
    id: 31,
    name: 'Short Liso',
    section: 'pijamas',
    category: 'Short',
    price: '$34.000',
    images: [
  
      '/imagenes/pijamas/short/liso/shortlisonegro.jpg'
    ],
    colors: ['Negro', 'Melange'],
    sizes: ['1', '2', '3', '4','5'],
    description: 'Confeccionado con morley viscosa y elastico en la cintura para un mejor agarre. Detalle de lazo en cintura. '
  },
  {
    id: 32,
    name: 'Short Print',
    section: 'pijamas',
    category: 'Short',
    price: '$34.000',
    images: [
   
      '/imagenes/pijamas/short/Short-Print/shortlisonegro.jpg'
    ],
    colors: ['Sebra Print'],
   sizes: ['1', '2', '3', '4','5'],
    description: 'Confeccionado con morley viscosa y elastico en la cintura para un mejor agarre. Detalle de lazo en cintura. '
  },
 
  {
    id: 33,
    name: 'Manga Larga',
    section: 'pijamas',
    category: 'Remeras Mangas Largas',
    price: '$26.000',
    images: [
      '/imagenes/pijamas/manga-larga/mangalarga.jpg',
      '/imagenes/pijamas/manga-larga/mangalarganegra.jpg',
      '/imagenes/pijamas/manga-larga/mangalarga2.jpg'
    ],
    colors: ['Blanco', 'Negro'],
    sizes: ['1', '2', '3', '4','5'],
    description: 'Remera de manga larga en algodón suave, ideal para noches frescas y descanso cómodo.'
  },
  {
    id: 34,
    name: 'Pantalón Liso',
    section: 'pijamas',
    category: 'Pantalones',
    price: '$30.000',
    images: [
      '/imagenes/pijamas/pantalones/liso-negro/negro.jpg',
      '/imagenes/pijamas/pantalones/liso-negro/pantalon-negro.jpg'
    ],
    colors: [ 'Negro'],
    sizes:  ['1', '2', '3', '4'],
    description: 'Confeccionado con modal soft y elástico en la cintura para un mejor agarre.'
  },
  {
    id: 35,
    name: 'Pantalón Rayas',
    section: 'pijamas',
    category: 'Pantalones',
    price: '$30.000',
    images: [
    
      '/imagenes/pijamas/pantalones/rayas/pantalon-rayas.jpg'
    ],
    colors: ['Gris'],
    sizes: ['1', '2', '3', '4'],
    description: 'Confeccionado con morley viscosa estampado, posee elástico en cintura para un mejor agarre.'
  },
  {
    id: 36,
    name: 'Pantalón Con Bolsillos',
    section: 'pijamas',
    category: 'Pantalones',
    price: '$35.000',
    images: [
      '/imagenes/pijamas/pantalones/liso-con-bolsillos/pantalon-bolsillo1.jpg',
      '/imagenes/pijamas/pantalones/liso-con-bolsillos/pantalon-bolsillos.jpg',
      '/imagenes/pijamas/pantalones/liso-con-bolsillos/pantalon-bolsillo.jpg',
      '/imagenes/pijamas/pantalones/liso-con-bolsillos/pantalon-bolsillo2.jpg'
    ],
    colors: ['Negro', 'Verde Musgo'],
    sizes: ['1', '2', '3', '4'],
    description: 'Confeccionado con interlock soft, abrigado, con bolsillos delanteros y cintura elastizada para un mejor agarre.',
    
  },
  
  
  {
    id: 21,
    name: 'Colales con elástico Anturio',
    section: 'mallas-y-bikinis',
    category: 'Bombachas',
    price: '$24.700',
    images: [
      '/imagenes/bikinis/bombachas/Colales-con-elástico-Anturio/Anturio-bombacha.jpg',
      '/imagenes/bikinis/bombachas/Colales-con-elástico-Anturio/anturio-bombacha2.jpg',
      '/imagenes/bikinis/bombachas/Colales-con-elástico-Anturio/anturio-bombacha3.jpg',
      '/imagenes/bikinis/bombachas/Colales-con-elástico-Anturio/anturio-bombacha4.jpg',
      '/imagenes/bikinis/bombachas/Colales-con-elástico-Anturio/anturio-bombacha1.jpg'
      
    ],
    colors: ['Coral', 'Negro', 'Animal Print','Marron'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Bombacha colaless de TRICOT LYCRA ROSSET, forrada con elástico en ambos lados.'
  },
  {
    id: 22,
    name: 'Vedetina tiro alto Hibisco',
    section: 'mallas-y-bikinis',
    category: 'Bombachas',
    price: '$26.000',
    images: [
      '/imagenes/bikinis/bombachas/Vedetina tiro alto Hibisco/Hibisco-bombacha.jpg',
      '/imagenes/bikinis/bombachas/Vedetina tiro alto Hibisco/Hibisco-bombacha1.jpg',
      '/imagenes/bikinis/bombachas/Vedetina tiro alto Hibisco/Hibisco-bombacha2.jpg',
      '/imagenes/bikinis/bombachas/Vedetina tiro alto Hibisco/Hibisco-bombacha3.jpg',
      '/imagenes/bikinis/bombachas/Vedetina tiro alto Hibisco/Hibisco-bombacha4.jpg'
    ],
     colors: ['Rojo', 'Negro', 'Animal Print','Marron','Verde'],
     sizes: ['1', '2', '3', '4', '5'],
    description: 'Bombacha vedetina tiro alto de TRICOT LYCRA ROSSET, forrada .'
  },
  {
    id: 23,
    name: 'Colales tiro medio Ixora',
    section: 'mallas-y-bikinis',
    category: 'Bombachas',
    price: '$26.000',
    images: [
      '/imagenes/bikinis/bombachas/Colales tiro medio Ixora/Ixora-bombacha.jpg',
      '/imagenes/bikinis/bombachas/Colales tiro medio Ixora/Ixora-bombacha1.jpg',
      '/imagenes/bikinis/bombachas/Colales tiro medio Ixora/Ixora-bombacha2.jpg'
    ],
      colors: ['Rojo', 'Negro','Marron','Verde'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Bombacha colaless  tiro medio de TRICOT LYCRA ROSSET , forrada, con cientura de 5 cm para mejor agarre.'
  },
  {
    id: 24,
    name: 'Corpiño Anturio',
    section: 'mallas-y-bikinis',
    category: 'Corpiños',
    price: '$29.000',
    images: [
      '/imagenes/bikinis/corpiños/Corpiño-Anturio/Corpiño-Anturio1.jpg',
      '/imagenes/bikinis/corpiños/Corpiño-Anturio/Corpiño-Anturio.jpg',
      '/imagenes/bikinis/corpiños/Corpiño-Anturio/Corpiño-Anturio2.jpg',
      '/imagenes/bikinis/corpiños/Corpiño-Anturio/Corpiño-Anturio3.jpg'
    ],
    colors: ['Marron con detalle nude', 'Coral con detalle en blanco', 'Negro'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Corpiño triangulo de TRICOT LYCRA® ROSSET, bretel regulable y tira para atar. Forrado.'
  },
  {
    id: 25,
    name: 'Corpiño Hibisco',
    section: 'mallas-y-bikinis',
    category: 'Corpiños',
    price: '$26.000',
    images: [
      'imagenes/bikinis/corpiños/Corpiño-Hibisco/Corpiño-Hibisco1.jpg',
      'imagenes/bikinis/corpiños/Corpiño-Hibisco/Corpiño-Hibisco.jpg'
    ],
     colors: ['Rojo', 'Negro','Marron','Verde','Animal Print'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Bombacha vedetina tiro alto de TRICOT LYCRA® ROSSET, forrada.'
  },
  {
    id: 26,
    name: 'Corpiño Ixora',
    section: 'mallas-y-bikinis',
    category: 'Corpiños',
    price: '$29.000',
    images: [
      '/imagenes/bikinis/corpiños/Corpiño-Ixora/Corpiño-Ixora.jpg',
      '/imagenes/bikinis/corpiños/Corpiño-Ixora/Corpiño-Ixora1.jpg',
      '/imagenes/bikinis/corpiños/Corpiño-Ixora/Corpiño-Ixora2.jpg',
      '/imagenes/bikinis/corpiños/Corpiño-Ixora/Corpiño-Ixora3.jpg'
    ],
    colors: ['Verde con detalle nude', 'Coral con detalle en blanco'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Corpiño top tipo triangulo de TRICOT LYCRA® ROSSET, bretel regulable. Forrado en el busto.'
  },
  {
    id: 106,
    name: 'Toalla Microfibra Secado Rápido',
    section: 'esenciales',
    category: 'Toallas de microfibra',
    price: '$11.500',
    images: ['/imagenes/esenciales/toallas.jpg',
      '/imagenes/esenciales/toalla1.jpg',
      '/imagenes/esenciales/toalla2.jpg',
      '/imagenes/esenciales/toalla3.jpg',
      '/imagenes/esenciales/toalla4.jpg'
    ],
    colors: ['Blanco', 'Beige'],
    sizes: ['Único'],
    description: 'Toalla de microfibra premium de secado ultra rápido. Liviana, compacta y súper absorbente. Ideal para llevar al gimnasio, la playa o en tus viajes.',
    badge: 'Esencial'
  },
  {
    id: 107,
    name: 'Corpiño Pia',
    section: 'ropa-interior',
    category: 'Corpiños',
    price: '$27.000',
    images: [
      '/imagenes/ropainterior/corpiño-pia/piablanco.jpg',
      '/imagenes/ropainterior/corpiño-pia/pianegro.jpg',
      '/imagenes/ropainterior/corpiño-pia/corpiño-pia.jpg'
    ],
    colors: ['Blanco', 'Negro', 'Beige'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Corpiño confeccionado de morley viscosa, forrado con modal soft al tono.'
  },
  {
    id: 108,
    name: 'Corpiño Sofia Algodón',
    section: 'ropa-interior',
    category: 'Corpiños',
    price: '$30.000',
    images: [
      '/imagenes/ropainterior/corpiño-sofia-algodon/sofiaalgodon.jpg',
   
    ],
    colors: ['Blanco', 'Negro', 'Beige'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Corpiño de lycra de algodon con detalle en puntilla, cerramiento en espalda con gancho de tela al tono.'
  },
  {
    id: 109,
    name: 'Corpiño Sofia Microtul',
    section: 'ropa-interior',
    category: 'Corpiños',
    price: '$30.000',
    images: [
      '/imagenes/ropainterior/corpiño-sofia-microtul/sofiamicrotul.jpg',
      '/imagenes/ropainterior/corpiño-sofia-microtul/sofiamicrotulnegro.jpg'
    ],
   colors: ['Blanco', 'Negro', 'Beige'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Corpiño de microtul con detalle en puntilla, cerramiento en espalda con gancho de tela al tono.'
  }
];

const SizeGuideModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-brand-soft-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-brand-warm-white p-2 rounded-xl max-w-md w-full max-h-[90vh] overflow-auto relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-10 bg-white/80 backdrop-blur p-2 rounded-full text-brand-soft-black hover:text-brand-cocoa transition-colors shadow-sm"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
            <div className="flex items-center justify-center rounded-lg overflow-hidden relative">
              <img 
                src="/imagenes/tabla-de-talles/talles.jpg" 
                alt="Tabla de talles" 
                className="w-full h-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ProductModal = ({ product, onClose, onAddToCart }: { product: Product, onClose: () => void, onAddToCart: (item: Omit<CartItem, 'id'>) => void }) => {
  const isPack = product.badge === 'Pack' || product.subCategory === 'Pack' || product.name.toLowerCase().includes('pack');
  const packSizeMatch = product.name.match(/x(\d)/i);
  const packSize = packSizeMatch ? parseInt(packSizeMatch[1], 10) : (isPack ? 2 : 1);

  const [currentImage, setCurrentImage] = useState(0);
  const [selectedColors, setSelectedColors] = useState<string[]>(Array(packSize).fill(product.colors[0]));
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % product.images.length);
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6 bg-brand-soft-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-brand-warm-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col md:flex-row shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button Mobile */}
          <button 
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 z-10 bg-brand-warm-white/80 p-2 rounded-full backdrop-blur-md"
          >
            <X size={20} />
          </button>

          {/* Image Carousel */}
          <div className="w-full md:w-1/2 relative bg-brand-nude/20 aspect-[3/4] md:aspect-auto md:min-h-[600px]">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={product.images[currentImage]}
                alt={`${product.name} - Imagen ${currentImage + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            
            {product.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-brand-warm-white/80 hover:bg-brand-warm-white p-2 rounded-full backdrop-blur-md transition-colors"
                >
                  <ChevronLeft size={20} strokeWidth={1.5} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-brand-warm-white/80 hover:bg-brand-warm-white p-2 rounded-full backdrop-blur-md transition-colors"
                >
                  <ChevronRight size={20} strokeWidth={1.5} />
                </button>
                
                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentImage(idx); }}
                      className={`w-2 h-2 rounded-full transition-all ${idx === currentImage ? 'bg-brand-soft-black w-4' : 'bg-brand-soft-black/30'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col relative">
            {/* Close Button Desktop */}
            <button 
              onClick={onClose}
              className="hidden md:block absolute top-8 right-8 text-brand-taupe hover:text-brand-soft-black transition-colors"
            >
              <X size={24} strokeWidth={1.5} />
            </button>

            <span className="uppercase tracking-widest text-xs font-semibold text-brand-taupe mb-4">{product.category}</span>
            <h2 className="font-serif text-3xl md:text-4xl mb-6 text-brand-soft-black">{product.name}</h2>
            
            <div className="space-y-2 mb-8 pb-8 border-b border-brand-taupe/10">
              <div className="flex justify-between items-center">
                <span className="text-brand-taupe font-light">Precio</span>
                <span className="font-serif text-2xl text-brand-cocoa">{product.price}</span>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="uppercase tracking-widest text-xs font-semibold text-brand-soft-black mb-4">Colores</h4>
              {Array.from({ length: packSize }).map((_, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  {packSize > 1 && <p className="text-xs font-medium text-brand-taupe mb-2">Color {i + 1}</p>}
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map(color => (
                      <button 
                        key={`${i}-${color}`} 
                        onClick={() => {
                          const newColors = [...selectedColors];
                          newColors[i] = color;
                          setSelectedColors(newColors);
                        }}
                        className={`px-4 py-2 border rounded-full text-xs transition-colors ${selectedColors[i] === color ? 'border-brand-soft-black bg-brand-soft-black text-white' : 'border-brand-taupe/30 hover:border-brand-soft-black'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h4 className="uppercase tracking-widest text-xs font-semibold text-brand-soft-black mb-4 flex justify-between">
                <span>Talles</span>
                <button onClick={() => setIsSizeGuideOpen(true)} className="text-brand-taupe hover:text-brand-cocoa underline underline-offset-4 font-light normal-case">Guía de talles</button>
              </h4>
              <div className="flex gap-3 flex-wrap">
                {product.sizes.map(size => (
                  <button 
                    key={size} 
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 flex items-center justify-center border rounded-full text-sm transition-colors ${selectedSize === size ? 'border-brand-soft-black bg-brand-soft-black text-white' : 'border-brand-taupe/30 hover:border-brand-soft-black'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h4 className="uppercase tracking-widest text-xs font-semibold text-brand-soft-black mb-4">Características</h4>
              <p className="text-brand-taupe font-light leading-relaxed text-sm">
                {product.description}
              </p>
            </div>

            <div className="mt-auto pt-6">
              <button 
                onClick={() => {
                  const price = parseInt(product.price.replace(/[^0-9]/g, ''), 10);
                  onAddToCart({
                    product,
                    size: selectedSize,
                    color: selectedColors.join(' + '),
                    quantity: 1,
                    price
                  });
                }}
                
                className="w-full bg-brand-soft-black text-brand-warm-white py-4 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-brand-cocoa transition-colors"
              >
                Agregar al Carrito
              </button>
            </div>

            <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Components ---

const Navbar = ({ onViewChange, cartCount, onOpenCart }: { onViewChange: (view: string) => void, cartCount: number, onOpenCart: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-brand-warm-white/90 backdrop-blur-md py-4 shadow-sm'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-brand-soft-black"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>

          {/* Desktop Links Left */}
          <div className="hidden md:flex space-x-8 text-sm uppercase tracking-widest font-medium text-brand-soft-black/80">
            <button onClick={() => onViewChange('about')} className="hover:text-brand-cocoa transition-colors">Quiénes somos</button>
            <button onClick={() => onViewChange('how-to-buy')} className="hover:text-brand-cocoa transition-colors">Cómo comprar</button>
            <button onClick={() => onViewChange('size-guide')} className="hover:text-brand-cocoa transition-colors">Tabla de talles</button>
            <button onClick={() => onViewChange('contact')} className="hover:text-brand-cocoa transition-colors">Contacto</button>
          </div>

          {/* Logo */}
          <div
            className="absolute left-1/2 -translate-x-1/2 cursor-pointer"
            onClick={() => onViewChange('home')}
          >
            <img
              src="/imagenes/logo.png"
              alt="mhum"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>

          {/* Desktop Links Right */}
          <div className="flex space-x-6 text-brand-soft-black/80">
            <button className="hidden md:block hover:text-brand-cocoa transition-colors">
              <Search size={20} strokeWidth={1.5} />
            </button>
            <button onClick={onOpenCart} className="hover:text-brand-cocoa transition-colors relative">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-brand-dusty-pink text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
            className="fixed inset-0 z-[60] bg-brand-warm-white flex flex-col"
          >
            <div className="p-6 flex justify-between items-center border-b border-brand-taupe/10">
              <h1 className="font-serif text-2xl italic tracking-wider">mhum</h1>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex flex-col p-8 space-y-8 text-xl font-serif">
              <button onClick={() => { onViewChange('about'); setIsMobileMenuOpen(false); }} className="text-left flex justify-between items-center">
                <span>Quiénes somos</span>
              </button>
              <button onClick={() => { onViewChange('how-to-buy'); setIsMobileMenuOpen(false); }} className="text-left flex justify-between items-center">
                <span>Cómo comprar</span>
              </button>
              <button onClick={() => { onViewChange('size-guide'); setIsMobileMenuOpen(false); }} className="text-left flex justify-between items-center">
                <span>Tabla de talles</span>
              </button>
              <button onClick={() => { onViewChange('contact'); setIsMobileMenuOpen(false); }} className="text-left flex justify-between items-center">
                <span>Contacto</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = ({ onViewChange }: { onViewChange: (view: string) => void }) => (
  <footer className="bg-brand-soft-black text-brand-warm-white pt-20 pb-10 px-6 md:px-12">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
      <div className="md:col-span-1">
        <h2 className="font-serif text-4xl italic mb-6 cursor-pointer" onClick={() => onViewChange('home')}>mhum</h2>
        <p className="text-brand-warm-white/60 text-sm font-light leading-relaxed max-w-xs">
          Lencería contemporánea diseñada para abrazar tu naturaleza. Suavidad, diseño y confort en cada detalle.
        </p>
      </div>
      <div>
        <h4 className="uppercase tracking-widest text-xs font-semibold mb-6 text-brand-sand">Explorar</h4>
        <ul className="space-y-4 text-sm text-brand-warm-white/70 font-light">
          <li><button onClick={() => onViewChange('ropa-interior')} className="hover:text-brand-dusty-pink transition-colors">Nueva Colección</button></li>
          <li><button onClick={() => onViewChange('ropa-interior')} className="hover:text-brand-dusty-pink transition-colors">Ropa Interior</button></li>
          <li><button onClick={() => onViewChange('pijamas')} className="hover:text-brand-dusty-pink transition-colors">Homewear</button></li>
          <li><button onClick={() => onViewChange('mallas-y-bikinis')} className="hover:text-brand-dusty-pink transition-colors">Bikinis</button></li>
        </ul>
      </div>
      <div>
        <h4 className="uppercase tracking-widest text-xs font-semibold mb-6 text-brand-sand">Ayuda</h4>
        <ul className="space-y-4 text-sm text-brand-warm-white/70 font-light">
          <li><button onClick={() => onViewChange('size-guide')} className="hover:text-brand-dusty-pink transition-colors">Guía de Talles</button></li>
          <li><button onClick={() => onViewChange('how-to-buy')} className="hover:text-brand-dusty-pink transition-colors">Envíos y Devoluciones</button></li>
          <li><button onClick={() => onViewChange('how-to-buy')} className="hover:text-brand-dusty-pink transition-colors">Preguntas Frecuentes</button></li>
          <li><button onClick={() => onViewChange('contact')} className="hover:text-brand-dusty-pink transition-colors">Contacto</button></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto border-t border-brand-warm-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-brand-warm-white/40 font-light">
      <p>© 2026 mhum. Todos los derechos reservados.</p>
      <div className="flex space-x-6 mt-4 md:mt-0">
        <button onClick={() => onViewChange('admin')} className="hover:text-brand-warm-white transition-colors">Admin</button>
        <a href="https://www.instagram.com/somos.mhum?igsh=MWJvYXExdnFnaTg3cQ==" className="hover:text-brand-warm-white transition-colors">Instagram</a>
      </div>
    </div>
  </footer>
);

// --- Views ---

const HomeView = ({ onViewChange, onProductClick }: { onViewChange: (view: string) => void, onProductClick: (product: Product) => void, key?: string }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], ['0%', '30%']);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-brand-warm-white"
    >
      {/* Hero Section */}
      <section className="relative h-[90vh] md:h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 z-0 w-full">
          
          {/* Video mobile */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="block md:hidden w-full h-full object-cover object-center"
          >
            <source src="videos/hero-mobile.mp4" type="video/mp4" />
          </video>

          {/* Video desktop */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="hidden md:block w-full h-full object-cover object-center"
          >
            <source src="videos/hero2.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-brand-soft-black/20 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-soft-black/60 via-transparent to-transparent" />
        </motion.div>

        <div className="relative z-10 text-center text-brand-warm-white px-6 mt-20">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="block uppercase tracking-[0.3em] text-xs font-semibold mb-6 text-brand-nude"
          >
            Colección Íntima 2026
          </motion.span>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl font-light mb-6 leading-tight"
          >
            Sentirte cómoda también <br />
            <span className="italic"> es diseño</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-xl font-light max-w-md mx-auto mb-10 text-brand-warm-white/90"
          >
            Textiles suaves, cortes limpios y una estética que respira con vos.
          </motion.p>

          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            onClick={() => onViewChange('ropa-interior')}
            className="bg-brand-warm-white text-brand-soft-black px-10 py-4 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-brand-nude transition-colors duration-300"
          >
            Explorar Colección
          </motion.button>
        </div>
      </section>

      {/* Editorial Categories Mosaic */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl mb-4">El Universo mhum</h2>
          <p className="text-brand-taupe font-light">Piezas diseñadas para cada momento de tu intimidad.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 auto-rows-[300px] md:auto-rows-[400px]">
          {/* Category 1: Large */}
          <div 
            className="md:col-span-7 relative group overflow-hidden rounded-2xl cursor-pointer"
            onClick={() => onViewChange('ropa-interior')}
          >
            <img 
              src="imagenes/ropainterior/ropainterior.png" 
              alt="Ropa Interior" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-soft-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 text-brand-warm-white">
              <h3 className="font-serif text-3xl italic mb-2">Ropa Interior</h3>
              <p className="text-sm font-light opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 flex items-center gap-2">
                Ver línea completa <ArrowRight size={16} />
              </p>
            </div>
          </div>

          {/* Category 2: Tall */}
          <div 
            className="md:col-span-5 md:row-span-2 relative group overflow-hidden rounded-2xl cursor-pointer"
            onClick={() => onViewChange('pijamas')}
          >
            <img 
              src="imagenes/pijamas/pijama.png" 
              alt="Pijamas y Homewear" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-soft-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 text-brand-warm-white">
              <h3 className="font-serif text-3xl italic mb-2">Homewear</h3>
              <p className="text-sm font-light opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 flex items-center gap-2">
                Descubrir <ArrowRight size={16} />
              </p>
            </div>
          </div>

          {/* Category 3: Small */}
          <div 
            className="md:col-span-4 relative group overflow-hidden rounded-2xl cursor-pointer"
            onClick={() => onViewChange('mallas-y-bikinis')}
          >
            <img 
              src="imagenes/bikinis/bikini.png" 
              alt="Bikinis" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-soft-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 text-brand-warm-white">
              <h3 className="font-serif text-2xl italic mb-2">Bikinis</h3>
            </div>
          </div>

          {/* Category 4: Small */}
          <div 
            className="md:col-span-3 relative group overflow-hidden rounded-2xl cursor-pointer bg-brand-nude flex items-center justify-center p-8 text-center"
            onClick={() => onViewChange('esenciales')}
          >
            <div>
              <h3 className="font-serif text-2xl italic text-brand-cocoa mb-4">Esenciales</h3>
              <p className="text-sm font-light text-brand-taupe mb-6">Toallas de microfibra y accesorios textiles.</p>
              <button className="text-xs uppercase tracking-widest font-semibold text-brand-soft-black border-b border-brand-soft-black pb-1">
                Explorar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Quote Block */}
      <section className="bg-brand-butter py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="block uppercase tracking-widest text-xs font-semibold text-brand-dusty-pink mb-8">Manifiesto</span>
          <h2 className="font-serif text-3xl md:text-5xl leading-relaxed text-brand-cocoa">
            "La ropa expresa lo que somos y elegirla como nosotros queremos es una forma de expresarnos ante el mundo."
          </h2>
        </div>
      </section>
    </motion.div>
  );
};

const categoryConfig: Record<string, any> = {
  'ropa-interior': {
    title: 'Ropa Interior',
    description: 'Nuestra colección principal. Diseños pensados para acompañar el movimiento natural de tu cuerpo con texturas nobles y calces perfectos.',
    image: 'imagenes/ropainterior/portada.png',
    filters: ['Todos', 'Conjuntos', 'Corpiños', 'Bombachas'],
    subFilters: {
      'Bombachas': ['Todas', 'Unidad', 'Pack']
    }
  },
  'pijamas': {
    title: 'Pijamas y Homewear',
    description: 'Prendas diseñadas para el descanso y la intimidad de tu hogar. Suavidad y confort en cada detalle.',
    image: 'imagenes/pijamas/PORTADA.jpg',
    filters: ['Todos', 'Conjunto Verano', 'Short', 'Remeras Mangas Largas', 'Pantalones'],
    subFilters: {}
  },
  'mallas-y-bikinis': {
    title: 'Mallas y Bikinis',
    description: 'Diseños que celebran el sol y el agua. Texturas premium y calces pensados para disfrutar del verano con elegancia.',
    image: 'imagenes/bikinis/PORTADA.png',
    filters: ['Todos', 'Corpiños', 'Bombachas'],
    subFilters: {}
  },
  'esenciales': {
    title: 'Esenciales',
    description: 'Complementos pensados para acompañar tu rutina diaria con la misma suavidad y calidad que nos caracteriza.',
    image: 'imagenes/esenciales/PORTADA.jpg',
    filters: ['Todos', 'Toallas de microfibra'],
    subFilters: {}
  }
};

const CategoryView = ({ categoryId, onViewChange, onAddToCart }: { categoryId: string, onViewChange: (view: string) => void, onAddToCart: (item: Omit<CartItem, 'id'>) => void, key?: string }) => {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [activeSubFilter, setActiveSubFilter] = useState('Todas');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const config = categoryConfig[categoryId] || categoryConfig['ropa-interior'];
  const filters = config.filters;
  const subFiltersMap = config.subFilters;

  const filteredProducts = productsData.filter(p => {
    if (p.section !== categoryId) return false;
    if (activeFilter === 'Todos') return true;
    
    // Check if current active filter has subfilters
    if (subFiltersMap[activeFilter]) {
      if (activeSubFilter === 'Todas') return p.category === activeFilter;
      return p.category === activeFilter && p.subCategory === activeSubFilter;
    }
    
    return p.category === activeFilter;
  });

  // Reset subfilter when changing main filter
  useEffect(() => {
    setActiveSubFilter('Todas');
  }, [activeFilter, categoryId]);

  // Reset filter when changing category
  useEffect(() => {
    setActiveFilter('Todos');
  }, [categoryId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-brand-warm-white min-h-screen pt-24"
    >
      {/* Category Hero */}
      <div className="px-6 md:px-12 max-w-7xl mx-auto mb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-brand-taupe mb-8">
          <button onClick={() => onViewChange('home')} className="hover:text-brand-soft-black transition-colors">Inicio</button>
          <span>/</span>
          <span className="text-brand-soft-black font-semibold">{config.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-serif text-5xl md:text-6xl mb-6">{config.title}</h1>
            <p className="text-brand-taupe font-light text-lg max-w-md leading-relaxed">
              {config.description}
            </p>
          </div>
          <div className="h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
             <img 
                src={config.image} 
                alt={config.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
          </div>
        </div>
      </div>

      {/* Visual Filters */}
      <div className="sticky top-[72px] z-40 bg-brand-warm-white/90 backdrop-blur-md border-y border-brand-taupe/10 py-4 mb-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex gap-4 overflow-x-auto no-scrollbar">
          {filters.map((filter: string) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-sm transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-brand-soft-black text-brand-warm-white'
                  : 'bg-transparent border border-brand-taupe/30 text-brand-soft-black hover:border-brand-soft-black'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-filters */}
      <AnimatePresence>
        {subFiltersMap[activeFilter] && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 48 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="max-w-7xl mx-auto px-6 md:px-12 flex gap-4 overflow-hidden"
          >
            {subFiltersMap[activeFilter].map((subFilter: string) => (
              <button
                key={subFilter}
                onClick={() => setActiveSubFilter(subFilter)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
                  activeSubFilter === subFilter
                    ? 'bg-brand-cocoa text-brand-warm-white'
                    : 'bg-transparent text-brand-taupe hover:text-brand-soft-black'
                }`}
              >
                {subFilter}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Grid */}
      <div className="px-6 md:px-12 max-w-7xl mx-auto pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div 
                key={product.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-5 bg-brand-nude/30">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {product.badge && (
                    <span className="absolute top-4 left-4 bg-brand-warm-white/90 backdrop-blur-sm text-brand-soft-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                      {product.badge}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    <button className="w-full bg-brand-warm-white/90 backdrop-blur-md text-brand-soft-black py-3 rounded-lg text-xs uppercase tracking-widest font-semibold hover:bg-brand-warm-white transition-colors shadow-sm">
                      Vista Rápida
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <h3 className="font-medium text-brand-soft-black mb-1 text-lg">{product.name}</h3>
                  <p className="text-sm text-brand-taupe font-light mb-2">{product.colors.join(' / ')}</p>
                  <span className="font-serif text-xl text-brand-cocoa">{product.price}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Load More */}
        <div className="mt-20 flex justify-center">
          <button className="border border-brand-soft-black text-brand-soft-black px-12 py-4 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-brand-soft-black hover:text-brand-warm-white transition-colors duration-300">
            Cargar más productos
          </button>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={onAddToCart}
        />
      )}
    </motion.div>
  );
};

// --- Main App ---

const AboutView = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
        <div className="order-2 md:order-1">
          <span className="block uppercase tracking-widest text-xs font-semibold text-brand-dusty-pink mb-6">Nuestra Historia</span>
          <h1 className="font-serif text-4xl md:text-5xl text-brand-cocoa mb-8 leading-tight">
            El arte de crear <span className="italic">para vos</span>.
          </h1>
          <div className="space-y-6 text-brand-taupe font-light leading-relaxed">
            <p>
              Mi nombre es Macarena Hum, diseñadora de Indumentaria, creadora de MHUM, desde sus diseños, su moldería hasta su confección. Diseño ropa interior, pijamas y bikinis que combinan comodidad y calidad.
            </p>
            <p>
              Las prendas que hoy les ofrezco en un inicio fueron ideas que surgieron del intercambio con cada clienta. ¿Por qué? Porque elegimos juntas la tela, el modelo y las modificaciones que le haríamos según el cuerpo y preferencia de cada una. Y aquellos conjuntos que fueron elegidos se les asignó el nombre de la primera persona que lo llegó a usar.
            </p>
            <p className="text-brand-soft-black font-medium text-lg italic mt-8">
              "La ropa expresa lo que somos, y elegirlas como nosotros queremos es una forma de expresarnos ante el mundo."
            </p>
          </div>
        </div>
        <div className="order-1 md:order-2 relative">
          <div className="aspect-[3/4] overflow-hidden rounded-2xl">
            <img 
              src="/imagenes/quienes-somos.png" 
              alt="Macarena Hum - MHUM" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-brand-nude rounded-full -z-10 blur-3xl opacity-50"></div>
        </div>
      </div>
    </motion.div>
  );
};

const HowToBuyView = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 max-w-4xl mx-auto"
    >
      <div className="text-center mb-16 md:mb-24">
        <span className="block uppercase tracking-widest text-xs font-semibold text-brand-dusty-pink mb-6">Guía de Compra</span>
        <h1 className="font-serif text-4xl md:text-5xl text-brand-cocoa mb-6">Cómo comprar</h1>
        <p className="text-brand-taupe font-light max-w-2xl mx-auto">
          Todo lo que necesitas saber sobre nuestro proceso de confección, envíos y políticas.
        </p>
      </div>

      <div className="space-y-16 md:space-y-24">
        {/* Section 1: Cómo comprar */}
        <section>
          <h2 className="font-serif text-2xl md:text-3xl text-brand-soft-black mb-8 border-b border-brand-taupe/20 pb-4">Proceso de Compra</h2>
          <div className="space-y-6 text-brand-taupe font-light leading-relaxed">
            <p></p>
            <p>En nuestro catálogo te mostramos todos los productos y sus talles. Contamos con stock limitado en Salta y Orán. Las prendas sin stock tienen una demora de confección de 5 a 10 días hábiles.</p>
            <p>Las prendas pueden personalizarse en medidas y materiales dentro de la tabla de talles. El precio que figura en cada producto es el precio vigente.</p>
            <p>Una vez confirmado el pago, comenzamos la confección con una demora de 5 a 10 días hábiles. Te avisaremos cuando esté listo para envío o retiro.</p>
          </div>
        </section>

        {/* Section 2: Medios de Pago */}
        <section>
          <h2 className="font-serif text-2xl md:text-3xl text-brand-soft-black mb-8 border-b border-brand-taupe/20 pb-4">Medios de Pago</h2>
          <ul className="space-y-4 text-brand-taupe font-light leading-relaxed list-disc pl-5">
            <li><strong className="font-medium text-brand-soft-black">Precio</strong>: valor único que figura en cada producto, aplica para el pago por transferencia/efectivo.</li>
          </ul>
        </section>

        {/* Section 3: Política de Devolución y Cambios */}
        <section>
          <h2 className="font-serif text-2xl md:text-3xl text-brand-soft-black mb-8 border-b border-brand-taupe/20 pb-4">Política de Devolución y Cambios</h2>
          <p className="text-brand-soft-black font-medium italic mb-8">Primero que nada gracias por elegir nuestras prendas 100% artesanales, no te vas a arrepentir!</p>
          <div className="space-y-8 text-brand-taupe font-light leading-relaxed">
            <div>
              <h3 className="text-brand-soft-black font-medium uppercase tracking-widest text-xs mb-2">Fallas en las prendas</h3>
              <p>En el caso de que la prenda tenga alguna falla, se comunican con su vendedora para realizar el cambio por exactamente la misma prenda (talle y color) que se compró. Esto se deberá hacer dentro de los 7 días desde que llegó su paquete. En este caso nos hacemos cargo del envío del mismo.</p>
            </div>
            <div>
              <h3 className="text-brand-soft-black font-medium uppercase tracking-widest text-xs mb-2">Prenda de stock</h3>
              <p>En caso de que no coincida el talle, se puede realizar el cambio, esto dependerá de lo que haya en stock en el momento. La prenda deberá estar LIMPIA y dentro de su packaging. Esto se podrá hacer hasta dos veces y en el caso de que haya envío se deberá hacer cargo la persona que lo compró.</p>
            </div>
            <div>
              <h3 className="text-brand-soft-black font-medium uppercase tracking-widest text-xs mb-2">Prendas confeccionadas a pedido</h3>
              <p>En caso que haya que hacer alguna modificación se envía el producto para hacerle las respectivas modificaciones, el envío corre por parte del cliente. La prenda se deberá entregar LIMPIA y dentro del packaging. Estas modificaciones se pueden realizar una vez, sin excepción.</p>
            </div>
            <div>
              <h3 className="text-brand-soft-black font-medium uppercase tracking-widest text-xs mb-2">Devoluciones</h3>
              <p>En caso de que el cliente quiera una devolución de un producto deberá gestionarlo dentro de los 5 días luego de haber realizado la compra o recibido el paquete. La prenda se deberá entregar LIMPIA y dentro del packaging. Se podrá hacer la devolución del dinero o se generará un cupón por el valor abonado para que el cliente utilice cuando quiera para una nueva compra. Al no tratarse de un error por parte de la empresa el COSTO DE ENVÍO CORRE A CARGO DEL CLIENTE SIN EXCEPCIÓN.</p>
            </div>
            <div>
              <h3 className="text-brand-soft-black font-medium uppercase tracking-widest text-xs mb-2">Envíos</h3>
              <p>Los envíos se realizan por correo argentino o BUSPACK. Estos se realizan los jueves de cada mes. Los mismos se coordinarán con el cliente. Los pedidos enviados a Salta y Orán se realizan una vez al mes, para que sea más barato el valor de envío del paquete y su entrega se coordinará con su vendedor.</p>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

const SizeGuideView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 max-w-4xl mx-auto text-center min-h-[70vh] flex flex-col items-center justify-center"
    >
      <span className="block uppercase tracking-widest text-xs font-semibold text-brand-dusty-pink mb-6">Medidas y Calce</span>
      <h1 className="font-serif text-4xl md:text-6xl text-brand-cocoa mb-12 leading-tight">
        ¿Cómo saber cuál es mi talle?
      </h1>
      <p className="text-brand-taupe font-light max-w-2xl mx-auto mb-12">
        Nuestras prendas están diseñadas para adaptarse a tu cuerpo. Utilizá nuestra tabla de medidas como guía para encontrar tu calce perfecto. Si tenés dudas o necesitás medidas personalizadas, no dudes en contactarnos.
      </p>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-brand-soft-black text-brand-warm-white px-10 py-4 uppercase tracking-widest text-sm hover:bg-brand-cocoa transition-colors duration-300"
      >
        Tabla de talles
      </button>

      <SizeGuideModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.div>
  );
};

const ContactView = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 max-w-6xl mx-auto min-h-[70vh] flex items-center"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center w-full">
        {/* Map Image */}
        <div className="relative aspect-[3/4] md:aspect-[4/5] bg-brand-warm-white flex items-center justify-center rounded-2xl overflow-hidden">
          <img 
            src="/imagenes/contacto/mapa.jpg" 
            alt="Mapa de Argentina" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Contact Info */}
        <div className="flex flex-col justify-center">
          <span className="block uppercase tracking-widest text-xs font-semibold text-brand-dusty-pink mb-4">Contacto</span>
          <h1 className="font-serif text-3xl md:text-4xl text-brand-cocoa mb-10">
            Representantes comerciales
          </h1>
          
          <div className="space-y-6 mb-12">
            <div className="flex items-start space-x-4">
              <MapPin className="w-5 h-5 text-brand-dusty-pink shrink-0 mt-1" />
              <div>
                <p className="font-medium text-brand-soft-black">Emilia - Orán, Salta</p>
                <a href="https://wa.me/5493878559490" target="_blank" rel="noopener noreferrer" className="text-brand-taupe hover:text-brand-cocoa transition-colors font-light">
                  +54 9 3878 55-9490
                </a>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <MapPin className="w-5 h-5 text-brand-dusty-pink shrink-0 mt-1" />
              <div>
                <p className="font-medium text-brand-soft-black">Macarena - Córdoba</p>
                <a href="https://wa.me/5493878436438" target="_blank" rel="noopener noreferrer" className="text-brand-taupe hover:text-brand-cocoa transition-colors font-light">
                  +54 9 3878 43-6438
                </a>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <MapPin className="w-5 h-5 text-brand-dusty-pink shrink-0 mt-1" />
              <div>
                <p className="font-medium text-brand-soft-black">Agustina - Salta Capital</p>
                <a href="https://wa.me/5493878610710" target="_blank" rel="noopener noreferrer" className="text-brand-taupe hover:text-brand-cocoa transition-colors font-light">
                  +54 9 3878 61-0710
                </a>
              </div>
            </div>
          </div>

          <div className="bg-brand-taupe/5 p-6 rounded-xl border border-brand-taupe/10">
            <p className="text-brand-soft-black font-medium leading-relaxed">
              Hacemos envíos a todo Argentina, consultanos para más información.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PROVINCES = [
  'CABA', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
];

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemove, 
  onUpdateQuantity 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  items: CartItem[]; 
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}) => {
  const [step, setStep] = useState<'cart' | 'form' | 'summary'>('cart');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
    street: '',
    number: '',
    apartment: '',
    city: '',
    province: '',
    postalCode: '',
    notes: ''
  });

  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const total = subtotal + shippingCost;

  // Reset step when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setStep('cart'), 300);
    }
  }, [isOpen]);

  const handleCalculateShipping = async () => {
    if (!formData.postalCode || formData.postalCode.length < 4 || !formData.province) return;
    setIsCalculatingShipping(true);
    try {
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cp_destino: formData.postalCode, provincia: formData.province, peso: 1, dimensiones: '20x20x20' })
      });
      const data = await response.json();
      if (data.rates) {
        setShippingRates(data.rates);
        setSelectedShipping(data.rates[0]); // Select first by default
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      alert('Error al calcular el envío');
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      // 1. Guardar el pedido en Firebase Firestore
      const orderData = {
        items: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price
        })),
        shippingMethod: selectedShipping ? selectedShipping.name : null,
        shippingCost: selectedShipping ? selectedShipping.price : 0,
        payer: formData,
        status: 'pending', // Estado inicial
        createdAt: serverTimestamp()
      };

      try {
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        
        // Disparar email de confirmación de compra
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'order_placed',
              to: formData.email,
              customerName: formData.firstName,
              orderId: docRef.id
            })
          });
        } catch (emailError) {
          console.error('Error al enviar email de confirmación:', emailError);
        }
      } catch (firebaseError) {
        console.error('Error al guardar en Firebase:', firebaseError);
        // Continuamos con el pago aunque falle el guardado para no bloquear la venta
      }

      // 2. Crear preferencia en Mercado Pago
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items, 
          origin: window.location.origin,
          shippingCost: selectedShipping ? selectedShipping.price : 0,
          shippingMethod: selectedShipping ? selectedShipping.name : null,
          payer: formData
        })
      });
      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert(`${data.error || 'Error al iniciar el pago'}\nDetalles: ${data.details || 'Sin detalles'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipping) {
      alert('Por favor, calculá y seleccioná un método de envío.');
      return;
    }
    setStep('summary');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-soft-black/40 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-brand-warm-white z-[90] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-brand-taupe/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {step !== 'cart' && (
                  <button onClick={() => setStep(step === 'summary' ? 'form' : 'cart')} className="text-brand-taupe hover:text-brand-soft-black transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                )}
                <h2 className="font-serif text-2xl text-brand-soft-black">
                  {step === 'cart' ? 'Tu Carrito' : step === 'form' ? 'Datos de Envío' : 'Resumen Final'}
                </h2>
              </div>
              <button onClick={onClose} className="text-brand-taupe hover:text-brand-soft-black transition-colors">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6">
              {step === 'cart' && (
                <div className="space-y-6 h-full flex flex-col">
                  {items.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-brand-taupe">
                      <ShoppingBag size={48} strokeWidth={1} className="mb-4 opacity-50" />
                      <p className="font-light">Tu carrito está vacío</p>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-grow">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-brand-taupe/5">
                          <div className="w-20 h-24 bg-brand-taupe/10 rounded-lg overflow-hidden shrink-0">
                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-grow flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium text-brand-soft-black text-sm pr-4">{item.product.name}</h3>
                                <button onClick={() => onRemove(item.id)} className="text-brand-taupe hover:text-brand-cocoa transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              <p className="text-xs text-brand-taupe mt-1">Talle: {item.size} | Color: {item.color}</p>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                              <div className="flex items-center border border-brand-taupe/20 rounded-full">
                                <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1.5 text-brand-taupe hover:text-brand-soft-black">
                                  <Minus size={14} />
                                </button>
                                <span className="w-6 text-center text-sm">{item.quantity}</span>
                                <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1.5 text-brand-taupe hover:text-brand-soft-black">
                                  <Plus size={14} />
                                </button>
                              </div>
                              <span className="font-medium text-brand-soft-black">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 'form' && (
                <form id="checkout-form" onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-brand-taupe mb-1">Nombre *</label>
                      <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-white border border-brand-taupe/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-soft-black" />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-taupe mb-1">Apellido *</label>
                      <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-white border border-brand-taupe/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-soft-black" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-brand-taupe mb-1">Email *</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-brand-taupe/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-soft-black" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-brand-taupe mb-1">Teléfono *</label>
                      <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white border border-brand-taupe/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-soft-black" />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-taupe mb-1">DNI (Opcional)</label>
                      <input type="text" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} className="w-full bg-white border border-brand-taupe/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-soft-black" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs text-brand-taupe mb-1">Calle *</label>
                      <input required type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full bg-white border border-brand-taupe/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-soft-black" />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-taupe mb-1">Número *</label>
                      <input required type="text" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full bg-white border border-brand-taupe/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-soft-black" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-brand-taupe mb-1">Piso/Depto (Opcional)</label>
                      <input type="text" value={formData.apartment} onChange={e => setFormData({...formData, apartment: e.target.value})} className="w-full bg-white border border-brand-taupe/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-soft-black" />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-taupe mb-1">Ciudad *</label>
                      <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-white border border-brand-taupe/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-soft-black" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-brand-taupe mb-1">Provincia *</label>
                      <select required value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full bg-white border border-brand-taupe/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-soft-black">
                        <option value="">Seleccionar...</option>
                        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-brand-taupe mb-1">Código Postal *</label>
                      <div className="flex gap-2">
                        <input required type="text" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="w-full bg-white border border-brand-taupe/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-soft-black" />
                        <button type="button" onClick={handleCalculateShipping} disabled={isCalculatingShipping || formData.postalCode.length < 4 || !formData.province} className="bg-brand-soft-black text-brand-warm-white px-3 rounded-lg text-xs hover:bg-brand-cocoa transition-colors disabled:opacity-50">
                          {isCalculatingShipping ? '...' : 'Cotizar'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-brand-taupe mb-1">Observaciones (Opcional)</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-white border border-brand-taupe/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-soft-black resize-none" rows={2} />
                  </div>

                  {shippingRates.length > 0 && (
                    <div className="mt-6 bg-brand-taupe/5 p-4 rounded-xl border border-brand-taupe/10">
                      <h4 className="text-sm font-medium text-brand-soft-black mb-3">Opciones de Envío</h4>
                      <div className="space-y-2">
                        {shippingRates.map((rate) => (
                          <label key={rate.id} className="flex items-center justify-between p-3 bg-white border border-brand-taupe/20 rounded-lg cursor-pointer hover:border-brand-soft-black transition-colors">
                            <div className="flex items-center gap-3">
                              <input 
                                type="radio" 
                                name="shipping" 
                                checked={selectedShipping?.id === rate.id}
                                onChange={() => setSelectedShipping(rate)}
                                className="accent-brand-soft-black"
                              />
                              <div>
                                <p className="text-sm font-medium text-brand-soft-black">{rate.name}</p>
                                {rate.estimated_days && (
                                  <p className="text-xs text-brand-taupe">Llega en {rate.estimated_days} días</p>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-medium text-brand-soft-black">
                              {rate.price === 0 ? 'Gratis' : `$${rate.price.toLocaleString('es-AR')}`}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              )}

              {step === 'summary' && (
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-taupe/5">
                    <h3 className="font-medium text-brand-soft-black mb-3 border-b border-brand-taupe/10 pb-2">Resumen de Productos</h3>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-brand-taupe">{item.quantity}x {item.product.name}</span>
                          <span className="font-medium text-brand-soft-black">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-taupe/5">
                    <h3 className="font-medium text-brand-soft-black mb-3 border-b border-brand-taupe/10 pb-2">Datos de Entrega</h3>
                    <div className="text-sm text-brand-taupe space-y-1">
                      <p><span className="font-medium text-brand-soft-black">Nombre:</span> {formData.firstName} {formData.lastName}</p>
                      <p><span className="font-medium text-brand-soft-black">Email:</span> {formData.email}</p>
                      <p><span className="font-medium text-brand-soft-black">Teléfono:</span> {formData.phone}</p>
                      <p><span className="font-medium text-brand-soft-black">Dirección:</span> {formData.street} {formData.number} {formData.apartment ? `Dpto ${formData.apartment}` : ''}</p>
                      <p><span className="font-medium text-brand-soft-black">Ubicación:</span> {formData.city}, {formData.province} (CP: {formData.postalCode})</p>
                      {formData.notes && <p><span className="font-medium text-brand-soft-black">Notas:</span> {formData.notes}</p>}
                    </div>
                  </div>

                  <div className="bg-brand-taupe/5 p-4 rounded-xl border border-brand-taupe/10 space-y-2">
                    <div className="flex justify-between items-center text-sm text-brand-taupe">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString('es-AR')}</span>
                    </div>
                    {selectedShipping && (
                      <div className="flex justify-between items-center text-sm text-brand-taupe">
                        <span>Envío ({selectedShipping.name})</span>
                        <span>{shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString('es-AR')}`}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-brand-taupe/10">
                      <span className="text-brand-soft-black font-medium">Total Final</span>
                      <span className="font-serif text-2xl text-brand-soft-black">${total.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-brand-taupe/10 bg-brand-warm-white">
                {step === 'cart' && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-brand-taupe">Subtotal</span>
                      <span className="font-serif text-2xl text-brand-soft-black">${subtotal.toLocaleString('es-AR')}</span>
                    </div>
                    <button 
                      onClick={() => setStep('form')}
                      className="w-full bg-brand-soft-black text-brand-warm-white py-4 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-brand-cocoa transition-colors"
                    >
                      Continuar compra
                    </button>
                  </>
                )}
                {step === 'form' && (
                  <button 
                    type="submit"
                    form="checkout-form"
                    className="w-full bg-brand-soft-black text-brand-warm-white py-4 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-brand-cocoa transition-colors"
                  >
                    Continuar al resumen
                  </button>
                )}
                {step === 'summary' && (
                  <button 
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="w-full bg-brand-soft-black text-brand-warm-white py-4 rounded-full uppercase tracking-widest text-xs font-semibold hover:bg-brand-cocoa transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    {isLoading ? 'Procesando...' : 'Confirmar datos y pagar'}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const contacts = [
    { name: 'Emilia - Orán, Salta', phone: '5493878559490' },
    { name: 'Macarena - Córdoba', phone: '5493878436438' },
    { name: 'Agustina - Salta Capital', phone: '5493878610710' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-brand-warm-white rounded-2xl shadow-xl border border-brand-taupe/10 overflow-hidden w-72"
          >
            <div className="bg-[#25D366] text-white p-4 flex justify-between items-center">
              <h3 className="font-medium">Contactanos</h3>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-2">
              {contacts.map((contact, idx) => (
                <a
                  key={idx}
                  href={`https://wa.me/${contact.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 hover:bg-brand-taupe/5 rounded-xl transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-10 h-10 bg-[#25D366]/10 rounded-full flex items-center justify-center text-[#25D366] shrink-0">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </div>
                  <span className="text-sm font-medium text-brand-soft-black">{contact.name}</span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#20bd5a] transition-all hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        )}
      </button>
    </div>
  );
};

const AdminView = () => {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email === 'crivisquisofia@gmail.com') {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubOrders = onSnapshot(q, (snapshot) => {
          const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setOrders(ordersData);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching orders:", error);
          setLoading(false);
        });
        return () => unsubOrders();
      } else {
        setOrders([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string, orderDetails: any) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });

      if (newStatus === 'shipped') {
        const trackingCode = window.prompt("Ingresá el código o link de seguimiento para el cliente (opcional):");
        
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'shipped',
              to: orderDetails.payer.email,
              customerName: orderDetails.payer.firstName,
              trackingCode: trackingCode || '',
              orderId: orderId
            })
          });
          alert("Estado actualizado y email de envío disparado.");
        } catch (emailError) {
          console.error("Error sending email:", emailError);
          alert("Estado actualizado, pero hubo un error al enviar el email.");
        }
      } else {
        alert("Estado actualizado.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Hubo un error al actualizar el estado.");
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) return <div className="pt-32 text-center text-brand-taupe">Cargando...</div>;

  if (!user) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-light mb-6 text-brand-soft-black">Panel de Administración</h2>
        <button onClick={handleLogin} className="bg-brand-soft-black text-brand-warm-white px-8 py-3 uppercase tracking-widest text-sm hover:bg-brand-cocoa transition-colors">
          Iniciar sesión con Google
        </button>
      </div>
    );
  }

  if (user.email !== 'crivisquisofia@gmail.com') {
    return (
      <div className="pt-32 pb-24 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-light mb-6 text-red-600">Acceso Denegado</h2>
        <p className="mb-6 text-brand-taupe">No tienes permisos para ver esta página.</p>
        <button onClick={handleLogout} className="underline text-brand-soft-black">Cerrar sesión</button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-light text-brand-soft-black">Pedidos</h2>
        <button onClick={handleLogout} className="text-sm underline text-brand-taupe hover:text-brand-soft-black transition-colors">Cerrar sesión</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-brand-taupe/20">
              <th className="p-4 font-medium text-sm text-brand-soft-black">Fecha</th>
              <th className="p-4 font-medium text-sm text-brand-soft-black">Cliente</th>
              <th className="p-4 font-medium text-sm text-brand-soft-black">Contacto</th>
              <th className="p-4 font-medium text-sm text-brand-soft-black">Envío</th>
              <th className="p-4 font-medium text-sm text-brand-soft-black">Total</th>
              <th className="p-4 font-medium text-sm text-brand-soft-black">Estado</th>
              <th className="p-4 font-medium text-sm text-brand-soft-black"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const total = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) + (order.shippingCost || 0);
              const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
              const isExpanded = expandedOrderId === order.id;
              
              return (
                <React.Fragment key={order.id}>
                  <tr className="border-b border-brand-taupe/10 hover:bg-brand-taupe/5">
                    <td className="p-4 text-sm text-brand-taupe">{date}</td>
                    <td className="p-4 text-sm text-brand-soft-black">{order.payer?.firstName} {order.payer?.lastName}</td>
                    <td className="p-4 text-sm text-brand-soft-black">{order.payer?.email}<br/><span className="text-xs text-brand-taupe">{order.payer?.phone}</span></td>
                    <td className="p-4 text-sm text-brand-soft-black">{order.shippingMethod}<br/><span className="text-xs text-brand-taupe">{order.payer?.street} {order.payer?.number}, {order.payer?.province}</span></td>
                    <td className="p-4 text-sm text-brand-soft-black">${total.toLocaleString('es-AR')}</td>
                    <td className="p-4 text-sm">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value, order)}
                        className="bg-transparent border border-brand-taupe/30 rounded px-2 py-1 text-xs uppercase tracking-wider text-brand-soft-black focus:outline-none focus:border-brand-soft-black"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="paid">Pagado</option>
                        <option value="packing">Empaquetando</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregado</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => toggleOrderDetails(order.id)}
                        className="text-xs underline text-brand-taupe hover:text-brand-soft-black transition-colors"
                      >
                        {isExpanded ? 'Ocultar' : 'Ver detalle'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-brand-taupe/5 border-b border-brand-taupe/10">
                      <td colSpan={7} className="p-6">
                        <div className="max-w-3xl">
                          <h4 className="text-sm font-medium text-brand-soft-black mb-4">Productos en este pedido:</h4>
                          <div className="space-y-3">
                            {order.items.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between items-center text-sm border-b border-brand-taupe/10 pb-2 last:border-0 last:pb-0">
                                <div className="flex items-center space-x-4">
                                  <span className="text-brand-soft-black">{item.quantity}x</span>
                                  <div>
                                    <p className="text-brand-soft-black">{item.name}</p>
                                    <p className="text-xs text-brand-taupe">
                                      {item.size && `Talle: ${item.size}`} {item.color && `| Color: ${item.color}`}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-brand-soft-black">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                              </div>
                            ))}
                          </div>
                          {order.shippingCost > 0 && (
                            <div className="flex justify-between items-center text-sm pt-3 mt-3 border-t border-brand-taupe/10">
                              <span className="text-brand-taupe">Costo de envío</span>
                              <span className="text-brand-soft-black">${order.shippingCost.toLocaleString('es-AR')}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-brand-taupe">No hay pedidos todavía.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // Check for Mercado Pago return status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status === 'success') {
      alert('¡Pago exitoso! Gracias por tu compra.');
      setCartItems([]);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'failure') {
      alert('El pago fue rechazado o no se pudo procesar.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleAddToCart = (item: Omit<CartItem, 'id'>) => {
    const id = `${item.product.id}-${item.size}-${item.color}`;
    setCartItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, { ...item, id }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-soft-black bg-brand-warm-white">
      <Navbar onViewChange={setCurrentView} cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {currentView === 'home' && <HomeView key="home" onViewChange={setCurrentView} onProductClick={setSelectedProduct} />}
          {currentView === 'ropa-interior' && <CategoryView key="ropa-interior" categoryId="ropa-interior" onViewChange={setCurrentView} onAddToCart={handleAddToCart} />}
          {currentView === 'pijamas' && <CategoryView key="pijamas" categoryId="pijamas" onViewChange={setCurrentView} onAddToCart={handleAddToCart} />}
          {currentView === 'mallas-y-bikinis' && <CategoryView key="mallas-y-bikinis" categoryId="mallas-y-bikinis" onViewChange={setCurrentView} onAddToCart={handleAddToCart} />}
          {currentView === 'esenciales' && <CategoryView key="esenciales" categoryId="esenciales" onViewChange={setCurrentView} onAddToCart={handleAddToCart} />}
          {currentView === 'about' && <AboutView key="about" />}
          {currentView === 'how-to-buy' && <HowToBuyView key="how-to-buy" />}
          {currentView === 'size-guide' && <SizeGuideView key="size-guide" />}
          {currentView === 'contact' && <ContactView key="contact" />}
          {currentView === 'admin' && <AdminView key="admin" />}
        </AnimatePresence>
      </main>

      <Footer onViewChange={setCurrentView} />

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />
        )}
      </AnimatePresence>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onRemove={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
      />

      <WhatsAppButton />
    </div>
  );
}
