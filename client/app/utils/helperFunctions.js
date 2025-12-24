export const limitTextLength = ( text, limit ) => {
    if(text.length > limit){
        return text.substring(0,limit) + '...';
    }
    return text;
};

const helperFunctions = {};

export default helperFunctions;