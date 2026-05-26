function parsePagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function buildPaginationResponse({ data, total, page, limit }) {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      total,
      page,
      pageSize: limit,
      totalPages,
    },
  };
}

module.exports = {
  parsePagination,
  buildPaginationResponse,
};
