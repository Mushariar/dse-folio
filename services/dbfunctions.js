export const getSqlQueryResult = async (pSqlQuery, bindVars, db) => {

    let QueryResult = await
    db.sequelize.query(pSqlQuery,
        { replacements: bindVars  }
    ).then(function (results) {
        return results[0];
    }).catch(function (err) {
        let errObj = {};
        errObj.code = err.parent.code;
        errObj.message = err.parent.hint;
        errObj.routine = err.parent.routine;
        errObj.position = err.parent.position;

        return errObj;        
    });
    return QueryResult;
};

