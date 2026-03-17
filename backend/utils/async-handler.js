// wrapper to catch errors in async route handlers
// usage: router.get('/', asyncHandler(async (req,res,next)=>{ ... }))
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { asyncHandler };




