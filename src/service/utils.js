export default class Utils{
    static contentTypes = new Map([["pdf","application/pdf"], ["png","image/png"], ["jpg","image/jpeg"], ["jpeg","image/jpeg"],
        ["txt","text/plain"],["csv","text/csv"],
        ["doc","application/msword"],["docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document"]]);

    static getContentTypeByExtention(ext){
        const result = Utils.contentTypes.get(ext);        
        return (result) ? result : "application/octet-stream";
    }

    static getFileExtension(filename){
        // get file extension
        const extension = filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
        return extension;
    }
}