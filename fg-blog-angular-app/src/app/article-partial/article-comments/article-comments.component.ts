import { Component, OnInit, Input, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommentsService } from './comments.service';
import { calTimeDifference } from '../../utils/utils';
import { doScrollTo, checkIsUpdate } from '../../utils/utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-article-comments',
  templateUrl: './article-comments.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./article-comments.component.css']
})
export class ArticleCommentsComponent implements OnInit {

  @Input() articleId: number;
  data = [];
  editComment: any;
  baseUrl: string;
  userIsAuthor: false;
  shareId: any; // using in template
  menuId: any; // using in template
  authorId: any; // using in template
  deleteId: any; // using in template

  constructor(private api: CommentsService, private cd: ChangeDetectorRef, private modalService: NgbModal) { }

  ngOnInit() {
    console.log("Post id: ", this.articleId);
    this.baseUrl = location.origin;
    this.getListComment(0);
  }

  get currentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  getListComment(idToScroll) {
    this.api.getCommentOfPost(this.articleId).subscribe(
      data => {
        this.data = data;
        console.log(data);
        this.cd.detectChanges();
        if (idToScroll !== 0) {
          doScrollTo(idToScroll);
        }
      },
      error => {
        console.log("get comment: ", error);
      }
    );
  }

  getTimePublish(publishTime) {
    return calTimeDifference(publishTime);
  }

  receivePostCommentEvent(newComment) {
    this.getListComment(newComment.id);
  }

  doEditComment(commentId) {
    this.editComment = commentId;
    const commentEle = document.getElementById(commentId);
    const contentEle = commentEle.querySelector('markdown') as HTMLElement;
    const menuEle = commentEle.querySelector('footer') as HTMLElement;
    const editEle = commentEle.querySelectorAll('app-comment-form')[0] as HTMLElement;
    const replyEle = commentEle.querySelectorAll('app-comment-form')[1] as HTMLElement;
    contentEle.style.display = "none";
    menuEle.style.visibility = "hidden";
    editEle.style.display = 'block';
    replyEle.style.display = "none";
  }

  receiveDiscardEdit(commentId) {
    const commentEle = document.getElementById(commentId);
    const contentEle = commentEle.querySelector('markdown') as HTMLElement;
    const menuEle = commentEle.querySelector('footer') as HTMLElement;
    const editEle = commentEle.querySelectorAll('app-comment-form')[0] as HTMLElement;
    const replyEle = commentEle.querySelectorAll('app-comment-form')[1] as HTMLElement;
    contentEle.style.display = "block";
    menuEle.style.visibility = "visible";
    editEle.style.display = 'none';
    replyEle.style.display = "none";
  }

  doReplyComment(commentId) {
    this.editComment = commentId;
    const commentEle = document.getElementById(commentId);
    const replyEle = commentEle.querySelectorAll('app-comment-form')[1] as HTMLElement;
    replyEle.style.display = "block";
  }

  isCommentEdited(createTime, updatedTime) {
    return checkIsUpdate(createTime, updatedTime);
  }

  openVerticallyCentered(content) {
    this.modalService.open(content, { centered: true });
  }

  doDeleteComment(commentId) {
    this.api.deleteComment(commentId).subscribe(
      data => {
        console.log("Delete comment: ", data);
        this.getListComment(commentId);
      },
      error => {
        console.log("Delete comment: ", error);
      }
    );
  }

  doCloseShare(shareId) {
    const shareEle = document.getElementById("share-" + shareId);
    shareEle.style.display = "none";
  }

  doHideDropdown(menuId) {
    const menuEle = document.getElementById("comment-menu-" + menuId);
    menuEle.style.display = "none";
  }

  /* To copy Text from Textbox */
  copyShareIdToClipboard(inputElement) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }

  doUpVoteComment(comment) {
    if ( this.currentUser.id !== comment.author) {
      // tslint:disable-next-line:prefer-const
      let voteUsers = comment.vote_users;
      if (voteUsers.hasOwnProperty(this.currentUser.id)) {
        const currVote = voteUsers[this.currentUser.id];
        if (currVote === 1) {
          delete voteUsers[this.currentUser.id];
        } else {
          voteUsers[this.currentUser.id] = 1;
        }
      } else {
        voteUsers[this.currentUser.id] = 1;
      }

      const formData = {
        author: comment.author,
        content: comment.content,
        post_parent: comment.post_parent,
        parent: comment.parent,
        vote_users: voteUsers
      };
      this.api.editComment(comment.id, formData).subscribe(
        data => {
          console.log("Edit post: Success");
          comment.vote = data.vote;
        },
        error => {
          console.log("Edit post: ", error);
        }
      );
    }
  }

  doDownVoteComment(comment) {
    if ( this.currentUser.id !== comment.author) {
      // tslint:disable-next-line:prefer-const
      let voteUsers = comment.vote_users;
      if (voteUsers.hasOwnProperty(this.currentUser.id)) {
        const currVote = voteUsers[this.currentUser.id];
        if (currVote === -1) {
          delete voteUsers[this.currentUser.id];
        } else {
          voteUsers[this.currentUser.id] = -1;
        }
      } else {
        voteUsers[this.currentUser.id] = -1;
      }

      const formData = {
        author: comment.author,
        content: comment.content,
        post_parent: comment.post_parent,
        parent: comment.parent,
        vote_users: voteUsers
      };
      this.api.editComment(comment.id, formData).subscribe(
        data => {
          console.log("Edit post: Success");
          comment.vote = data.vote;
        },
        error => {
          console.log("Edit post: ", error);
        }
      );
    }
  }

  isUpVote(comment) {
    // tslint:disable-next-line:prefer-const
    let voteUsers = comment.vote_users;
    if (voteUsers.hasOwnProperty(this.currentUser.id)) {
      if (voteUsers[this.currentUser.id] === 1) {
        return true;
      }
    }
    return false;
  }

  isDownVote(comment) {
    // tslint:disable-next-line:prefer-const
    let voteUsers = comment.vote_users;
    if (voteUsers.hasOwnProperty(this.currentUser.id)) {
      if (voteUsers[this.currentUser.id] === -1) {
        return true;
      }
    }
    return false;
  }
}
