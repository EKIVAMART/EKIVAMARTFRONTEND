'use client'

import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../lib/store'
import type { AppStore } from '../lib/store'

const store: AppStore = makeStore()

interface StoreProviderProps {
  children: ReactNode
}

export default function StoreProvider({ children }: StoreProviderProps) {
  return <Provider store={store}>{children}</Provider>
}
