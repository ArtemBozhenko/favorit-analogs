import { SearchForm } from '../features/search-part/SearchForm'
import { BrandList } from '../features/select-brand/BrandList'
import { AnalogsTable } from '../features/analogs/AnalogsTable'

export function App() {
  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <header className="mb-4">
        <h1 className="h3">Поиск аналогов запчастей</h1>
        <p className="text-secondary mb-0">Введите артикул, выберите производителя и сравните аналоги по цене и наличию</p>
      </header>
      <div className="card shadow-sm mb-4">
        <div className="card-body"><SearchForm /></div>
      </div>
      <div className="row g-4">
        <div className="col-lg-4"><BrandList /></div>
        <div className="col-lg-8"><AnalogsTable /></div>
      </div>
    </div>
  )
}
