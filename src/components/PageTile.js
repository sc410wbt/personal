import React from 'react'
import {withRouter} from "react-router-dom"
import {useSelector} from "react-redux"

import pageData from '../library/pages.json'

import s from './PageTitle.module.sass'


function PageTitle(props) {

	return (
		<div className={s.wrapper} dangerouslySetInnerHTML={{ __html: pageData[0].title }} />
	)

}

export default withRouter(PageTitle)
