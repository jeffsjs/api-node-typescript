import * as restify from 'restify'
import * as mongoose from 'mongoose'
import { ModelRouter } from '../common/model-router'
import { Review } from './reviews.model'

class ReviewsRouter extends ModelRouter<Review> {
  constructor() {
    super(Review)
  }
  
  protected prepareOne(query: mongoose.DocumentQuery<Review, Review>): mongoose.DocumentQuery<Review, Review> {
    return query
      .populate('user', 'name')
      .populate('restaurant', 'name')
  }


  applayRoutes(application: restify.Server) {
    application.get('/reviews', this.findAll)
    application.get('/reviews/:id', [this.validateId, this.findById])
    application.post('/reviews', this.save)
    application.put('/reviews/:id', [this.validateId, this.replace])
    application.patch('/reviews/:id', [this.validateId, this.update])
    application.del('/reviews/:id', [this.validateId, this.delete])

  }
}

export const reviewsRouter = new ReviewsRouter()
