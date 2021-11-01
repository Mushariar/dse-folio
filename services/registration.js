import { getSqlQueryResult } from "./dbfunctions";
import models from "../models";
var mail = require('../utl/email/mailerWithTemp');
import { getPasswordResetToken, checkPasswordResetToken } from './authorizarion';

const getMemberId = async (membertype) => {

  const dynamicSearch = `SELECT CONCAT(:membertype, LPAD(IFNULL(max(substring_index(substring(memberid, 3), \'/\', 1)), 0) + 1, 4, '0'), \'/\', YEAR(CURDATE())) as memberid FROM tab_members WHERE substring(memberid, 1,2) = :membertype`;

  var bindVars = {
    membertype: membertype,
    //applicationid: applicationid
  };

  return getSqlQueryResult(dynamicSearch, bindVars, models)
    .then(function (result) {
      return result[0].memberid;
    }).catch(function (e) {
      throw e;
    });
}

export const saveRegistration = async (data) => {

  try {
    let vMemberTypeCode = data.typeofmembership.substr(0, 1) + 'M';

    if (!data.memberid || data.memberid === '') {
      let vMemberId = await getMemberId(vMemberTypeCode, models);
      data.memberid = vMemberId;
      vMemberTypeCode
    }
    else {
      //Check MemberId Format Validation
    }

    if (vMemberTypeCode === 'LM') {
      data.typeofmembership_bn = 'আজীবন সদস্য';
    }
    if (vMemberTypeCode === 'GM') {
      data.typeofmembership_bn = 'সাধারণ সদস্য';
    }
    if (vMemberTypeCode === 'HM') {
      data.typeofmembership_bn = 'সম্মাননাসূচক সদস্য';
    }

    data.dob = (data.dob === '' ? null : data.dob);
    data.dateofmarriage = (data.dateofmarriage === '' ? null : data.dateofmarriage);
    data.paymentamount = (data.paymentamount === '' ? 0 : data.paymentamount);
    data.paymentdate = (data.paymentdate === '' ? null : data.paymentdate);
    data.facebookurl = (data.facebookurl === 'facebook.com/' ? null : data.facebookurl);
    data.applyid = (data.applyid ? data.applyid : null);

    data.child1dob = null;
    data.child2dob = null;
    data.child3dob = null;
    data.child4dob = null;

    data.child1name = null;
    data.child1name = null;
    data.child1name = null;
    data.child1name = null;

    let childname = data['childname[]'];

    if (childname && (childname instanceof Array)){
      if (childname.length > 0) {
        childname.forEach(function (chnm, i) {
          if (i === 0)
            data.child1name = chnm;
          else if (i === 1)
            data.child2name = chnm;
          else if (i === 2)
            data.child3name = chnm;
          else if (i === 3)
            data.child4name = chnm;
        });
      }
    }
    else{
      data.child1name = childname;
    }

    let childdob = data['childdob[]'];

    if (childdob && (childdob instanceof Array)){
      if (childdob.length > 0) {
        childdob.forEach(function (chdob, i) {
          if (i === 0)
            data.child1dob = (chdob === '' ? null : chdob);
          else if (i === 1)
            data.child2dob = (chdob === '' ? null : chdob);
          else if (i === 2)
            data.child3dob = (chdob === '' ? null : chdob);
          else if (i === 3)
            data.child4dob = (chdob === '' ? null : chdob);
        });
      }
    }
    else{
      data.child1dob = (childdob === '' ? null : childdob);
    }

    return models.tabMembers.create({
      memberid: data.memberid,
      firstname: data.firstname,
      fullname_bn: data.fullname_bn,
      fathername: data.fathername,
      mothername: data.mothername,
      dob: data.dob,
      bloodgroup: data.bloodgroup,
      nid: data.nid,
      sscbatch: data.sscbatch,
      presentaddress: data.presentaddress,
      presentupozillathana: data.presentupozillathana,
      presentdistrict: data.presentdistrict,
      presentdivision: data.presentdivision,
      parmanentaddress: data.parmanentaddress,
      permanentvillage: data.permanentvillage,
      permanentupozillathana: data.permanentupozillathana,
      permanentdistrict: data.permanentdistrict,
      permanentdivision: data.permanentdivision,
      mobile: data.mobile,
      email: data.email,
      facebookurl: data.facebookurl,
      occupation: data.occupation,
      organization: data.organization,
      officeaddress: data.officeaddress,
      officephone: data.officephone,
      maritalsattus: data.maritalsattus,
      spousename: data.spousename,
      dateofmarriage: data.dateofmarriage,
      child1name: data.child1name,
      child1dob: data.child1dob,
      child2name: data.child2name,
      child2dob: data.child2dob,
      child3name: data.child3name,
      child3dob: data.child3dob,
      child4name: data.child4name,
      child4dob: data.child4dob,
      typeofmembership: data.typeofmembership,
      typeofmembership_bn: data.typeofmembership_bn,
      typeofpayment: data.typeofpayment,
      paymentid: data.paymentid,
      paymentamount: data.paymentamount,
      paymentdate: data.paymentdate,
      memberimageurl: data.memberimageurl,
      applyid: data.applyid
    }).then(async function (tabMember) {

      let newMember = tabMember.get({ plain: true });
      if (data.email !== '') {

        models.sysUsers.create({
          email: data.email,
          passwordstring: '',
          firstname: data.firstname,
          lastname: '',
          fullname_bn: data.fullname_bn,
          admin: 0,
          memberid: data.memberid,
          allowedip: null,
          forcepassword: 1,
          wrongpassattempt: 0,
          islocked: 0,
          autounlock: null,
          isactive: 1,
          passwordexpirydate: null,
          resetpasswordurl: null,
          updatedby: 1,
          createdby: 1
        }).then(async function (user) {
          //send email for activation link
          // try {
          //   let passrestToken = await getPasswordResetToken(data.email, data.memberid);
          //   let activateAccount = {};

          //   activateAccount.passwordtoken = passrestToken;
          //   activateAccount.redirecturl = "http://localhost:8989/resetpassword";

          //   await mail.sendAccountCreated(newMember, activateAccount);
          // }
          // catch (e) {
          //   throw e;
          // }

        }).catch((err) => {
          throw err;
        });
      }
      return newMember;
    })
      .catch((e) => {
        throw e;
      });
  }
  catch (err) {
    throw err;
  };


}

export const updateRegistration = async (data) => {

  let vMemberTypeCode = data.typeofmembership.substr(0, 1) + 'M';

  if (vMemberTypeCode === 'LM') {
    data.typeofmembership_bn = 'আজীবন সদস্য';
  }
  if (vMemberTypeCode === 'GM') {
    data.typeofmembership_bn = 'সাধারণ সদস্য';
  }
  if (vMemberTypeCode === 'HM') {
    data.typeofmembership_bn = 'সম্মাননাসূচক সদস্য';
  }

  data.dob = (data.dob === '' ? null : data.dob);
  data.dateofmarriage = (data.dateofmarriage === '' ? null : data.dateofmarriage);
  data.paymentamount = (data.paymentamount === '' ? 0 : data.paymentamount);
  data.paymentdate = (data.paymentdate === '' ? null : data.paymentdate);
  data.facebookurl = (data.facebookurl === 'facebook.com/' ? null : data.facebookurl);

  data.child1dob = (data.child1dob === '' ? null : data.child1dob);
  data.child2dob = (data.child2dob === '' ? null : data.child2dob);
  data.child3dob = (data.child3dob === '' ? null : data.child3dob);
  data.child4dob = (data.child4dob === '' ? null : data.child4dob);

  return models.tabMembers.update({
    firstname: data.firstname,
    fullname_bn: data.fullname_bn,
    fathername: data.fathername,
    mothername: data.mothername,
    dob: data.dob,
    bloodgroup: data.bloodgroup,
    nid: data.nid,
    sscbatch: data.sscbatch,
    presentaddress: data.presentaddress,
    presentupozillathana: data.presentupozillathana,
    presentdistrict: data.presentdistrict,
    presentdivision: data.presentdivision,
    parmanentaddress: data.parmanentaddress,
    permanentvillage: data.permanentvillage,
    permanentupozillathana: data.permanentupozillathana,
    permanentdistrict: data.permanentdistrict,
    permanentdivision: data.permanentdivision,
    mobile: data.mobile,
    email: data.email,
    facebookurl: data.facebookurl,
    occupation: data.occupation,
    organization: data.organization,
    officeaddress: data.officeaddress,
    officephone: data.officephone,
    maritalsattus: data.maritalsattus,
    spousename: data.spousename,
    dateofmarriage: data.dateofmarriage,
    child1name: data.child1name,
    child1dob: data.child1dob,
    child2name: data.child2name,
    child2dob: data.child2dob,
    child3name: data.child3name,
    child3dob: data.child3dob,
    child4name: data.child4name,
    child4dob: data.child4dob,
    typeofmembership: data.typeofmembership,
    typeofmembership_bn: data.typeofmembership_bn,
    typeofpayment: data.typeofpayment,
    paymentid: data.paymentid,
    paymentamount: data.paymentamount,
    paymentdate: data.paymentdate,
    memberimageurl: data.memberimageurl
  },
    {
      where: {
        memberid: data.memberid
      }
    }).then(function (tabMember) {

      if (data.email && data.email !== '') {
        models.sysUsers.update({
          email: data.email,
          firstname: data.firstname,
          lastname: '',
          updatedby: 1
        },
          {
            where: {
              memberid: data.memberid
            }
          }).then(function (user) {
            //send email for activation link
            //user.dataValues;
          }).catch((err) => {
            throw err;
          });
      }

      return tabMember[0];
    })
    .catch((e) => {
      throw e;
    });

}


export const getMember = async (pId) => {

  return models.tabMembers.findOne({
    where: {
      [models.Sequelize.Op.or]: [
        { id: pId },
        { memberid: pId }
      ]
    }
  })
    .then(function (Member) {
      return Member;
    }).catch(function (err) {
      console.log('Oops! something went wrong, : ', err);
    });
}

export const getMemberList = async () => {
  return models.tabMembers.findAll({
    order: [
      ['id', 'DESC']
    ],
    attributes: ['id', 'memberid', 'typeofmembership', 'typeofmembership_bn', 'fullname_bn', 'firstname', 'fathername', 'mothername', 'dob', 'bloodgroup', 'nid', 'email', 'mobile', 'facebookurl', 'occupation', 'organization', 'paymentdate', 'memberimageurl']
  }).then(function (Members) {
    return Members;
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

export const getMemberActiveList = async (pIsActive) => {
  return models.tabMembers.findAll({
    where: { membershipstatus: pIsActive },
    order: [
      ['id', 'DESC']
    ],
    attributes: ['id', 'memberid', 'typeofmembership', 'typeofmembership_bn', 'fullname_bn', 'firstname', 'fathername', 'mothername', 'dob', 'bloodgroup', 'nid', 'email', 'mobile', 'facebookurl', 'occupation', 'organization', 'paymentdate', 'memberimageurl']
  }).then(function (Members) {
    return Members;
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

export const getApprovalMemberList = async (Pstatus) => {
  return models.tabApplyMember.findAll({
    where: { membershipstatus: Pstatus },
    order: [
      ['id', 'DESC']
    ],
    attributes: ['id', 'typeofmembership', 'fullname_bn', 'firstname', 'fathername', 'mothername', 'dob', 'bloodgroup', 'nid', 'email', 'mobile', 'facebookurl', 'occupation', 'organization', 'paymentdate', 'memberimageurl']
  }).then(function (Members) {
    return Members;
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

export const getApproveMember = async (pId) => {
  return models.tabApplyMember.findOne({
    where: {
      [models.Sequelize.Op.or]: [
        { id: pId }
      ]
    }
  })
    .then(function (Member) {
      return Member;
    }).catch(function (err) {
      console.log('Oops! something went wrong, : ', err);
    });
}


export const saveApplyRegistration = async (data) => {

  data.dob = (data.dob === '' ? null : data.dob);
  data.dateofmarriage = (data.dateofmarriage === '' ? null : data.dateofmarriage);
  data.paymentamount = (data.paymentamount === '' ? 0 : data.paymentamount);
  data.paymentdate = (data.paymentdate === '' ? null : data.paymentdate);
  data.facebookurl = (data.facebookurl === 'facebook.com/' ? null : data.facebookurl);

  data.child1dob = null;
  data.child2dob = null;
  data.child3dob = null;
  data.child4dob = null;

  data.child1name = null;
  data.child2name = null;
  data.child3name = null;
  data.child4name = null;


  let childname = data['childname[]'];

    if (childname && (childname instanceof Array)){
      if (childname.length > 0) {
        childname.forEach(function (chnm, i) {
          if (i === 0)
            data.child1name = chnm;
          else if (i === 1)
            data.child2name = chnm;
          else if (i === 2)
            data.child3name = chnm;
          else if (i === 3)
            data.child4name = chnm;
        });
      }
    }
    else{
      data.child1name = childname;
    }

    let childdob = data['childdob[]'];

    if (childdob && (childdob instanceof Array)){
      if (childdob.length > 0) {
        childdob.forEach(function (chdob, i) {
          if (i === 0)
            data.child1dob = (chdob === '' ? null : chdob);
          else if (i === 1)
            data.child2dob = (chdob === '' ? null : chdob);
          else if (i === 2)
            data.child3dob = (chdob === '' ? null : chdob);
          else if (i === 3)
            data.child4dob = (chdob === '' ? null : chdob);
        });
      }
    }
    else{
      data.child1dob = (childdob === '' ? null : childdob);
    }

  return models.tabApplyMember.create({
    firstname: data.firstname,
    fullname_bn: data.fullname_bn,
    fathername: data.fathername,
    mothername: data.mothername,
    dob: data.dob,
    bloodgroup: data.bloodgroup,
    nid: data.nid,
    sscbatch: data.sscbatch,
    presentaddress: data.presentaddress,
    presentupozillathana: data.presentupozillathana,
    presentdistrict: data.presentdistrict,
    presentdivision: data.presentdivision,
    parmanentaddress: data.parmanentaddress,
    permanentvillage: data.permanentvillage,
    permanentupozillathana: data.permanentupozillathana,
    permanentdistrict: data.permanentdistrict,
    permanentdivision: data.permanentdivision,
    mobile: data.mobile,
    email: data.email,
    facebookurl: data.facebookurl,
    occupation: data.occupation,
    organization: data.organization,
    officeaddress: data.officeaddress,
    officephone: data.officephone,
    maritalsattus: data.maritalsattus,
    spousename: data.spousename,
    dateofmarriage: data.dateofmarriage,
    child1name: data.child1name,
    child1dob: data.child1dob,
    child2name: data.child2name,
    child2dob: data.child2dob,
    child3name: data.child3name,
    child3dob: data.child3dob,
    child4name: data.child4name,
    child4dob: data.child4dob,
    typeofmembership: data.typeofmembership,
    typeofpayment: data.typeofpayment,
    paymentid: data.paymentid,
    paymentamount: data.paymentamount,
    paymentdate: data.paymentdate,
    memberimageurl: data.memberimageurl
  }).then(async function (tabApplMember) {

    // if (data.email !== '') {

    //   try {

    //     let emailData = {};
    //     emailData.receiver = data.email;
    //     emailData.fullname = data.fullname_bn;
    //     emailData.redirecturl = "http://localhost:8989/resetpassword";
    //     //await mail.sendPasswordReset(emailData);
    //   }
    //   catch (e) {
    //     throw e;
    //   }
    // }

    return tabApplMember.get({ plain: true });
  })
    .catch((e) => {
      throw e;
    });

}

export const updateApplyMember = async (pId, pStatus) => {

  return models.tabApplyMember.update({
    membershipstatus: pStatus
  },
    {
      where: {
        id: pId
      }
    }).then(function (tabApplyMember) {
      return tabApplyMember[0];
    })
    .catch((e) => {
      throw e;
    });

}


function camelToUnderscore(key) {
  var result = key.replace(/([A-Z])/g, " $1");
  return result.split(' ').join('_').toLowerCase();
}