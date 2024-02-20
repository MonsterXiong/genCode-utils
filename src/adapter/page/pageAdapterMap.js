const { PAGE_TYPE_ENUM } = require('../../enum')
const { getCrudAdapterData } = require('./crud/index')
const { getMatrixAdapterData } = require('./matrix/index')
/* Software Gen Code Require Placeholder */

const PAGE_ADAPTER_MAP = {
    [PAGE_TYPE_ENUM.CRUD]: getCrudAdapterData,
    [PAGE_TYPE_ENUM.MATRIX]: getMatrixAdapterData,
	/* Software Gen Code Placeholder */
}

module.exports = {
    PAGE_ADAPTER_MAP
}


