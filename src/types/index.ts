export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    totalData:        number; // total data
    totalPages:       number; // total page
    page:             number; // current page
    limit:            number; // limit per page
    checkedMonth?:    number;
    checkedYear?:     number;
  };
}

export interface Village {
  id: number, 
  name: string,
  status: number
}