import { Router } from './router'
import * as mongoose from 'mongoose'
import * as restify from 'restify'
import { NotFoundError } from 'restify-errors'

export abstract class ModelRouter<D extends mongoose.Document> extends Router {
  constructor(protected model: mongoose.Model<D>) {
    super()
  }

  protected prepareOne(query: mongoose.DocumentQuery<D, D>): mongoose.DocumentQuery<D, D> {
    return query
  }

  validateId = (req: restify.Request, resp: restify.Response, next: restify.Next)=> {
    return !mongoose.Types.ObjectId.isValid(req.params.id) ? next(new NotFoundError('Document not found')) : next()
  }

  findAll = (req: restify.Request, resp: restify.Response, next: restify.Next)=> {
    this.model.find()
      .then(this.renderAll(resp, next))
      .catch(next)
  }

  findById = (req: restify.Request, resp: restify.Response, next: restify.Next)=> {
    this.prepareOne(this.model.findById(req.params.id))
      .then(this.render(resp, next))
      .catch(next)
  }

  save = (req: restify.Request, resp: restify.Response, next: restify.Next) => {
    let document = new this.model(req.body)
    document.save()
      .then(this.render(resp, next))
      .catch(next)
  }

  replace = (req: restify.Request, resp: restify.Response, next: restify.Next) => {
    const options = { runValidators: true, overwrite: true }
    this.model.update({_id: req.params.id }, req.body, options).exec().then(result => { 
      if (result.n) {
        return this.model.findById(req.params.id)
      } else {
        throw new NotFoundError('Documento não encontrado')
      }
    })
      .then(this.render(resp, next))
      .catch(next)
  }

  update = (req: restify.Request, resp: restify.Response, next: restify.Next) => {
    const options = { runValidators: true, new: true }
    this.model.findByIdAndUpdate(req.params.id, req.body, options)
      .then(this.render(resp, next))
      .catch(next)
  }

  delete = (req: restify.Request, resp: restify.Response, next: restify.Next)=> {
    this.model.deleteOne({_id: req.params.id }).then((result : any) => {
      if (result.n) {
        resp.send(204)
      } else {
        throw new NotFoundError('Documento não encontrado')
      }
      return next()
    }).catch(next)
  }
}