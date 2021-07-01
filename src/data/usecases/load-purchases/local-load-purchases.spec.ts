import { LocalLoadPurchases } from '@/data/usecases'
import { mockPurchases, CacheStoreSpy, getCacheExpirationDate } from '@/data/tests'
 

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

  test('Should return empty list if load fails', async () => {
     const { cacheStore, sut } = makeSut()
     cacheStore.simulateFetchError()
     const purchase = await sut.loadAll()
     expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
     expect(purchase).toEqual([])
   })

    test('Should return a list of a purchases is cache is valid', async () => {
      const currentDate = new Date()
      const timestamp = getCacheExpirationDate(currentDate)
      timestamp.setSeconds(timestamp.getSeconds() + 1)
      const { cacheStore, sut } = makeSut(currentDate)
      cacheStore.fetchResult = {
          timestamp,
          value: mockPurchases()
      }
      const purchase = await sut.loadAll()
      expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch]) 
      expect(cacheStore.fetchKey).toBe('purchases')   
      expect(purchase).toEqual(cacheStore.fetchResult.value)
    })

    test('Should return an empty list if cache is expired', async () => {
        const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate)
        timestamp.setSeconds(timestamp.getSeconds() -1)
      const { cacheStore, sut } = makeSut(currentDate)
      cacheStore.fetchResult = {
          timestamp,
          value: mockPurchases()
      }
      const purchase = await sut.loadAll()
      expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete]) 
      expect(cacheStore.fetchKey).toBe('purchases')   
      expect(cacheStore.deleteKey).toBe('purchases')   
      expect(purchase).toEqual([])
    })

    test('Should return an empty list if cache is on expiration date', async () => {
        const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate)
      const { cacheStore, sut } = makeSut(currentDate)
      cacheStore.fetchResult = {
          timestamp,
          value: mockPurchases()
      }
      const purchase = await sut.loadAll()
      expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete]) 
      expect(cacheStore.fetchKey).toBe('purchases')   
      expect(cacheStore.deleteKey).toBe('purchases')   
      expect(purchase).toEqual([])
    })

    test('Should return an empty list if cache is empty', async () => {
        const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate)
        timestamp.setSeconds(timestamp.getSeconds() +1)
        const { cacheStore, sut } = makeSut(currentDate)
        cacheStore.fetchResult = {
            timestamp,
            value: []
        }
        const purchase = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch]) 
        expect(cacheStore.fetchKey).toBe('purchases')   
        expect(purchase).toEqual([])
      })
})
