import React from 'react';

type EventCallback = (data: any) => void;

export enum EventTypes {
  SHOW_TOAST = 'SHOW_TOAST',
  SHOW_TOOLTIP = 'SHOW_TOOLTIP',
  HIDE_TOOLTIP = 'HIDE_TOOLTIP'
}

export interface ToastData {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export interface TooltipData {
  content: string | React.ReactNode;
  targetRect: DOMRect; // Posición del elemento que dispara el tooltip
  position?: 'top' | 'bottom' | 'left' | 'right';
}

class EventBus {
  private events: { [key: string]: EventCallback[] } = {};

  on(event: EventTypes, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: EventTypes, callback: EventCallback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: EventTypes, data?: any) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

export const eventBus = new EventBus();