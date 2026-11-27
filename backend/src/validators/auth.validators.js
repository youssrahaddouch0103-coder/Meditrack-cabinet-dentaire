const { body, oneOf } = require('express-validator');

const password = (field) =>
  body(field)
    .isString().withMessage('Mot de passe obligatoire')
    .isLength({ min: 8, max: 128 }).withMessage('Le mot de passe doit contenir entre 8 et 128 caractères');

exports.register = [
  body('firstName').trim().notEmpty().withMessage('Le prénom est obligatoire').isLength({ max: 60 }),
  body('lastName').trim().notEmpty().withMessage('Le nom est obligatoire').isLength({ max: 60 }),
  body('email').trim().isEmail().withMessage('Email invalide').normalizeEmail({ gmail_remove_dots: false }),
  body('phone').optional({ values: 'falsy' }).trim().matches(/^[+0-9 ().-]{6,20}$/).withMessage('Téléphone invalide'),
  oneOf([password('password'), password('motDePasse')], { message: 'Le mot de passe doit contenir entre 8 et 128 caractères' })
];

exports.login = [
  body('email').trim().isEmail().withMessage('Email invalide'),
  oneOf([body('password').isString().notEmpty(), body('motDePasse').isString().notEmpty()], {
    message: 'Mot de passe obligatoire'
  })
];

exports.verifyTwoFactor = [
  body('challengeId').isMongoId().withMessage('Défi 2FA invalide'),
  body('code').trim().matches(/^\d{6}$/).withMessage('Le code contient 6 chiffres')
];

exports.forgotPassword = [body('email').trim().isEmail().withMessage('Email invalide')];

exports.resetPassword = [
  body('token').isHexadecimal().isLength({ min: 64, max: 64 }).withMessage('Lien invalide'),
  password('newPassword')
];
