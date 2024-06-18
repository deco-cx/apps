import { state as storeState } from './context.ts'
import type { Product } from '../../commerce/types.ts'
import type { Manifest } from '../manifest.gen.ts'
import { invoke } from '../runtime.ts'

const { selectedAddress, loading } = storeState

type EnqueuableActions<K extends keyof Manifest['actions']> = Manifest['actions'][K]['default'] extends (
    ...args: any[]
) => Promise<Product[] | null>
    ? K
    : never

const enqueue =
    <K extends keyof Manifest['actions']>(key: EnqueuableActions<K>) =>
    (props: Parameters<Manifest['actions'][K]['default']>[0]) =>
        storeState.enqueue(signal => invoke({ selectedAddress: { key, props } } as any, { signal }) as any)

const state = {
    selectedAddress,
    loading,
    selectAddress: enqueue('wake/actions/selectAddress.ts'),
}

export const useAddress = () => state
