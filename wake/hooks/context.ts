import { IS_BROWSER } from '$fresh/runtime.ts'
import { signal } from '@preact/signals'
import type { Person } from '../../commerce/types.ts'
import { invoke } from '../runtime.ts'
import { setClientCookie } from '../utils/cart.ts'
import type {
    CheckoutFragment,
    ShopQuery,
    WishlistReducedProductFragment,
} from '../utils/graphql/storefront.graphql.gen.ts'

export interface Context {
    cart: Partial<CheckoutFragment>
    user: Person | null
    wishlist: WishlistReducedProductFragment[] | null
    selectedShipping: Awaited<ReturnType<typeof invoke.wake.loaders.selectedShipping>>
    selectedAddress: Awaited<ReturnType<typeof invoke.wake.loaders.selectedAddress>>
}

const loading = signal<boolean>(true)
const context = {
    cart: signal<Partial<CheckoutFragment>>({}),
    user: signal<Person | null>(null),
    wishlist: signal<WishlistReducedProductFragment[] | null>(null),
    shop: signal<ShopQuery['shop'] | null>(null),
    selectedShipping: signal<Awaited<ReturnType<typeof invoke.wake.loaders.selectedShipping>>>(null),
    selectedAddress: signal<Awaited<ReturnType<typeof invoke.wake.loaders.selectedAddress>>>(null),
}

let queue2 = Promise.resolve()
let abort2 = () => {}

let queue = Promise.resolve()
let abort = () => {}
const enqueue = (cb: (signal: AbortSignal) => Promise<Partial<Context>> | Partial<Context>) => {
    abort()

    loading.value = true
    const controller = new AbortController()

    queue = queue.then(async () => {
        try {
            const { cart, user, wishlist, selectedShipping, selectedAddress } = await cb(controller.signal)

            if (controller.signal.aborted) {
                throw { name: 'AbortError' }
            }

            context.cart.value = { ...context.cart.value, ...cart }
            context.user.value = user || context.user.value
            context.wishlist.value = wishlist || context.wishlist.value
            context.selectedShipping.value = selectedShipping || context.selectedShipping.value
            context.selectedAddress.value = selectedAddress || context.selectedAddress.value

            loading.value = false
        } catch (error) {
            if (error.name === 'AbortError') return

            console.error(error)
            loading.value = false
        }
    })

    abort = () => controller.abort()

    return queue
}

const enqueue2 = (cb: (signal: AbortSignal) => Promise<Partial<Context>> | Partial<Context>) => {
    abort2()

    loading.value = true
    const controller = new AbortController()

    queue2 = queue2.then(async () => {
        try {
            const { shop } = await cb(controller.signal)
            const useCustomCheckout = await invoke.wake.loaders.useCustomCheckout()
            const isLocalhost = window.location.hostname === 'localhost'

            if (!isLocalhost && !useCustomCheckout) {
                const url = new URL('/api/carrinho', shop.checkoutUrl)

                const { Id } = await fetch(url, { credentials: 'include' }).then(r => r.json())

                if (controller.signal.aborted) {
                    throw { name: 'AbortError' }
                }

                setClientCookie(Id)
            }

            enqueue(load)

            loading.value = false
        } catch (error) {
            if (error.name === 'AbortError') return

            console.error(error)
            loading.value = false
        }
    })

    abort2 = () => controller.abort()

    return queue2
}

const load2 = (signal: AbortSignal) =>
    invoke(
        {
            shop: invoke.wake.loaders.shop(),
        },
        { signal },
    )

const load = (signal: AbortSignal) =>
    invoke(
        {
            cart: invoke.wake.loaders.cart(),
            user: invoke.wake.loaders.user(),
            wishlist: invoke.wake.loaders.wishlist(),
            selectedShipping: invoke.wake.loaders.selectedShipping(),
            selectedAddress: invoke.wake.loaders.selectedAddress(),
        },
        { signal },
    )

if (IS_BROWSER) {
    enqueue2(load2)
    enqueue(load)

    document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && enqueue(load))
}

export const state = {
    ...context,
    loading,
    enqueue,
}
