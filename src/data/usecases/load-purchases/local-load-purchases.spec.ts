import { LocalLoadPurchases } from '@/data/usecases'
import { mockPurchases, CacheStoreSpy } from '@/data/tests'
 

type SutTypes = {
    sut: LocalLoadPurchases
    cacheStore: CacheStoreSpy
}

const makeSut = (timestamp = new Date()): SutTypes => {
    const cacheStore = new CacheStoreSpy()
    const sut =  new LocalLoadPurchases(cacheStore, timestamp)
    return {
        sut,
        cacheStore
    }
}

describe('LocalLoadPurchase', () => {
 test('Should not delete or insert cache on sut.init', () => {
    const { cacheStore } = makeSut()
    expect(cacheStore.actions).toEqual([])
  })

  test('Should call correct key on load', async () => {
     const { cacheStore, sut } = makeSut()
     await sut.loadAll()
     expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
     expect(cacheStore.fetchKey).toBe('purchases')
   })

  test('Should return empty list if load fails', async () => {
     const { cacheStore, sut } = makeSut()
     cacheStore.simulateFetchError()
     const purchase = await sut.loadAll()
     expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete])
     expect(cacheStore.deleteKey).toBe('purchases')
     expect(purchase).toEqual([])
   })
})
