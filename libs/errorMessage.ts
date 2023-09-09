// Pulls the { error } message our API routes send back, if there is one.
const errorMessage = (error: any) => {
  return error?.response?.data?.error || 'Something went wrong';
};

export default errorMessage;
